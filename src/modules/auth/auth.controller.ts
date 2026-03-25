import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

type RequestWithMeta = Request;

function _readIpAddress(request: RequestWithMeta): string | null {
  return request.ip ?? null;
}

function _readUserAgent(request: RequestWithMeta): string | null {
  const userAgentHeader = request.headers['user-agent'];
  return typeof userAgentHeader === 'string' ? userAgentHeader : null;
}

function _readRefreshTokenFromCookie(request: RequestWithMeta): string | null {
  const cookies = (request as Request & { cookies?: Record<string, unknown> }).cookies;
  if (cookies === undefined) {
    return null;
  }
  const rawToken = cookies.refresh_token;
  return typeof rawToken === 'string' && rawToken.trim().length > 0
    ? rawToken
    : null;
}

@Controller('v1/auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  public async register(
    @Body() dto: RegisterDto,
    @Req() request: RequestWithMeta,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(
      dto,
      response,
      _readIpAddress(request),
      _readUserAgent(request),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  public async login(
    @Body() dto: LoginDto,
    @Req() request: RequestWithMeta,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(
      dto,
      response,
      _readIpAddress(request),
      _readUserAgent(request),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: RequestWithMeta,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const refreshTokenFromCookie = _readRefreshTokenFromCookie(request);
    const payload: RefreshTokenDto = {
      refreshToken: dto.refreshToken ?? refreshTokenFromCookie ?? undefined,
    };

    return this.authService.refresh(
      payload,
      response,
      _readIpAddress(request),
      _readUserAgent(request),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Body() dto: RefreshTokenDto,
    @Req() request: RequestWithMeta,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: true }> {
    const refreshTokenFromCookie = _readRefreshTokenFromCookie(request);
    const payload: RefreshTokenDto = {
      refreshToken: dto.refreshToken ?? refreshTokenFromCookie ?? undefined,
    };

    return this.authService.logout(
      payload,
      response,
      _readIpAddress(request),
      _readUserAgent(request),
    );
  }
}
