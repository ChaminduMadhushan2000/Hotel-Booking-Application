import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { IsNull, Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { ServiceResult } from '../shared/types/service-result';
import { User } from '../users/entities/user.entity';
import { AuthLockoutService } from './auth-lockout.service';
import { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    private readonly auditService: AuditService,
    private readonly authTokenService: AuthTokenService,
    private readonly authLockoutService: AuthLockoutService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  public async register(
    dto: RegisterDto,
    response: Response,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ accessToken: string }> {
    try {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.userRepo.findOne({
        where: { email, deletedAt: IsNull() },
      });
      if (existing !== null) {
        throw new HttpException('Email already registered', HttpStatus.CONFLICT);
      }
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = this.userRepo.create({
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        role: 'guest',
      });
      const savedUser = await this.userRepo.save(user);
      const issued = await this.authTokenService._issueTokens(savedUser, randomUUID());
      if (!issued.success || issued.data === null) {
        throw new HttpException(
          'Authentication unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      this.authTokenService._attachRefreshCookie(response, issued.data.refreshToken);
      try {
        await this.auditService.log({
          entityType: 'User',
          entityId: savedUser.id,
          action: 'CREATE',
          oldValues: null,
          newValues: savedUser,
          operatorId: savedUser.id,
          ipAddress: ipAddress ?? undefined,
          userAgent: userAgent ?? undefined,
        });
      } catch (_error: unknown) {
        this.logger.warn('Audit write failed');
      }
      return { accessToken: issued.data.accessToken };
    } catch (_error: unknown) {
      if (_error instanceof HttpException) {
        throw _error;
      }
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async login(
    dto: LoginDto,
    response: Response,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ accessToken: string }> {
    try {
      const email = dto.email.trim().toLowerCase();
      const found = await this.userRepo.findOne({
        where: { email, deletedAt: IsNull() },
      });
      let validation: ServiceResult<User> = {
        success: true,
        message: 'Credentials validated',
        data: found,
      };
      if (found === null) {
        validation = {
          success: false,
          message: 'Invalid email or password',
          data: null,
        };
      } else {
        const lockout = await this.authLockoutService._checkLockout(found);
        if (!lockout.success) {
          validation = { success: false, message: lockout.message, data: null };
        } else {
          const matched = await bcrypt.compare(dto.password, found.passwordHash);
          if (!matched) {
            await this.authLockoutService._recordFailedAttempt(found);
            validation = {
              success: false,
              message: 'Invalid email or password',
              data: null,
            };
          }
        }
      }
      if (!validation.success || validation.data === null) {
        try {
          await this.auditService.log({
            entityType: 'User',
            entityId: dto.email.toLowerCase(),
            action: 'LOGIN_FAILED',
            oldValues: null,
            newValues: null,
            operatorId: undefined,
            ipAddress: ipAddress ?? undefined,
            userAgent: userAgent ?? undefined,
          });
        } catch (_error: unknown) {
          this.logger.warn('Audit write failed');
        }
        throw new UnauthorizedException(validation.message);
      }
      const issued = await this.authTokenService._issueTokens(
        validation.data,
        randomUUID(),
      );
      if (!issued.success || issued.data === null) {
        throw new HttpException(
          'Authentication unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      await this.authLockoutService._resetFailedAttempts(validation.data);
      this.authTokenService._attachRefreshCookie(response, issued.data.refreshToken);
      try {
        await this.auditService.log({
          entityType: 'User',
          entityId: validation.data.id,
          action: 'LOGIN',
          oldValues: null,
          newValues: null,
          operatorId: validation.data.id,
          ipAddress: ipAddress ?? undefined,
          userAgent: userAgent ?? undefined,
        });
      } catch (_error: unknown) {
        this.logger.warn('Audit write failed');
      }
      return { accessToken: issued.data.accessToken };
    } catch (_error: unknown) {
      if (_error instanceof HttpException) {
        throw _error;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async refresh(
    dto: RefreshTokenDto,
    response: Response,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ accessToken: string }> {
    try {
      const rawToken = dto.refreshToken;
      if (rawToken === undefined || rawToken.trim().length === 0) {
        throw new UnauthorizedException('Missing refresh token');
      }
      const tokenHash = this.authTokenService._hashToken(rawToken);
      const found = await this.refreshTokenRepo.findOne({
        where: { tokenHash, deletedAt: IsNull() },
      });
      const verified = await this.authTokenService._verifyRefreshToken(rawToken);
      if (!verified.success || verified.data === null || found === null) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      if (found.isRevoked || found.expiresAt.getTime() <= Date.now()) {
        await this.authTokenService._revokeTokenFamily(found.family);
        throw new UnauthorizedException('Refresh token expired');
      }
      if (verified.data.family !== found.family || verified.data.sub !== found.userId) {
        await this.authTokenService._revokeTokenFamily(found.family);
        throw new UnauthorizedException('Refresh token reuse detected');
      }
      const user = await this.userRepo.findOne({
        where: { id: found.userId, deletedAt: IsNull() },
      });
      if (user === null) {
        throw new UnauthorizedException('User not found');
      }
      const rotated = await this.authTokenService._rotateRefreshToken(found, user);
      if (!rotated.success || rotated.data === null) {
        throw new HttpException('Token rotation failed', HttpStatus.SERVICE_UNAVAILABLE);
      }
      this.authTokenService._attachRefreshCookie(response, rotated.data.refreshToken);
      try {
        await this.auditService.log({
          entityType: 'User',
          entityId: user.id,
          action: 'LOGIN',
          oldValues: null,
          newValues: null,
          operatorId: user.id,
          ipAddress: ipAddress ?? undefined,
          userAgent: userAgent ?? undefined,
        });
      } catch (_error: unknown) {
        this.logger.warn('Audit write failed');
      }
      return { accessToken: rotated.data.accessToken };
    } catch (_error: unknown) {
      if (_error instanceof HttpException) {
        throw _error;
      }
      throw new HttpException('Token refresh failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async logout(
    dto: RefreshTokenDto,
    response: Response,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<{ success: true }> {
    try {
      if (dto.refreshToken !== undefined && dto.refreshToken.trim().length > 0) {
        const tokenHash = this.authTokenService._hashToken(dto.refreshToken);
        const found = await this.refreshTokenRepo.findOne({
          where: { tokenHash, deletedAt: IsNull() },
        });
        if (found !== null) {
          await this.refreshTokenRepo.update({ id: found.id }, { isRevoked: true });
          try {
            await this.auditService.log({
              entityType: 'User',
              entityId: found.userId,
              action: 'LOGOUT',
              oldValues: null,
              newValues: null,
              operatorId: found.userId,
              ipAddress: ipAddress ?? undefined,
              userAgent: userAgent ?? undefined,
            });
          } catch (_error: unknown) {
            this.logger.warn('Audit write failed');
          }
        }
      }
      response.clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      return { success: true };
    } catch (_error: unknown) {
      if (_error instanceof HttpException) {
        throw _error;
      }
      throw new HttpException('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
