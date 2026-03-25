import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: string;
  family?: string;
  iat?: number;
  exp?: number;
}

interface RefreshAuthenticatedUser {
  id: string;
  email: string;
  role: string;
  family: string;
  refreshToken: string;
}

type RequestWithCookies = Request;

function _normalizeKey(rawKey: string): string {
  return rawKey.replace(/\\n/g, '\n');
}

function _cookieExtractor(request: RequestWithCookies): string | null {
  const cookies = (request as Request & { cookies?: Record<string, unknown> }).cookies;
  if (cookies === undefined || cookies === null) {
    return null;
  }

  const rawToken = cookies.refresh_token;
  if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    return null;
  }

  return rawToken;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  public constructor() {
    const publicKey = _normalizeKey(process.env.JWT_PUBLIC_KEY ?? '');

    if (publicKey.trim().length === 0) {
      throw new Error('JWT_PUBLIC_KEY is required for JwtRefreshStrategy');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([_cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  public async validate(
    request: RequestWithCookies,
    payload: JwtRefreshPayload,
  ): Promise<RefreshAuthenticatedUser> {
    const refreshToken = _cookieExtractor(request);

    if (
      refreshToken === null ||
      payload.sub.trim().length === 0 ||
      payload.email.trim().length === 0 ||
      payload.role.trim().length === 0 ||
      payload.family === undefined ||
      payload.family.trim().length === 0
    ) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      family: payload.family,
      refreshToken,
    };
  }
}
