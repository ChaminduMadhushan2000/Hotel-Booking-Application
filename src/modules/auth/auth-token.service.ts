import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Response } from 'express';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { ServiceResult } from '../shared/types/service-result';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  family: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  family?: string;
}

@Injectable()
export class AuthTokenService {
  public constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  public async _issueTokens(user: User, family: string): Promise<ServiceResult<TokenPair>> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      family,
    };
    const privateKey = (process.env.JWT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
    if (privateKey.length === 0) {
      return { success: false, message: 'Missing signing key', data: null };
    }
    const accessTtl = (process.env.JWT_ACCESS_EXPIRES ?? '15m') as StringValue;
    const refreshTtl = (process.env.JWT_REFRESH_EXPIRES ?? '7d') as StringValue;
    const accessToken = await this.jwtService.signAsync(payload, {
      algorithm: 'RS256',
      expiresIn: accessTtl,
      privateKey,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      algorithm: 'RS256',
      expiresIn: refreshTtl,
      privateKey,
    });
    const entity = this.refreshTokenRepo.create({
      tokenHash: this._hashToken(refreshToken),
      userId: user.id,
      family,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepo.save(entity);
    return {
      success: true,
      message: 'Tokens issued',
      data: { accessToken, refreshToken, family },
    };
  }

  public async _rotateRefreshToken(
    current: RefreshToken,
    user: User,
  ): Promise<ServiceResult<TokenPair>> {
    current.isRevoked = true;
    await this.refreshTokenRepo.save(current);
    return this._issueTokens(user, current.family);
  }

  public async _revokeTokenFamily(family: string): Promise<void> {
    await this.refreshTokenRepo.update({ family }, { isRevoked: true });
  }

  public async _verifyRefreshToken(rawToken: string): Promise<ServiceResult<JwtPayload>> {
    const publicKey = (process.env.JWT_PUBLIC_KEY ?? '').replace(/\\n/g, '\n');
    if (publicKey.length === 0) {
      return { success: false, message: 'Missing verify key', data: null };
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(rawToken, {
        algorithms: ['RS256'],
        publicKey,
      });
      return { success: true, message: 'Token verified', data: payload };
    } catch (_error: unknown) {
      return { success: false, message: 'Invalid refresh token', data: null };
    }
  }

  public _hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  public _attachRefreshCookie(response: Response, token: string): void {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
