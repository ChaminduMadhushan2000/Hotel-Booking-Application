import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
  family?: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

function _normalizeKey(rawKey: string): string {
  return rawKey.replace(/\\n/g, '\n');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  public constructor() {
    const publicKey = _normalizeKey(process.env.JWT_PUBLIC_KEY ?? '');

    if (publicKey.trim().length === 0) {
      throw new Error('JWT_PUBLIC_KEY is required for JwtStrategy');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  public async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    if (
      payload.sub.trim().length === 0 ||
      payload.email.trim().length === 0 ||
      payload.role.trim().length === 0
    ) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
