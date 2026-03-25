import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthLockoutService } from './auth-lockout.service';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';

function _normalizePem(key: string): string {
  return key.replace(/\\n/g, '\n');
}

@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    AuditModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 900000,
        limit: 10,
      },
    ]),
    JwtModule.registerAsync({
      useFactory: (): {
        privateKey: string;
        publicKey: string;
        signOptions: { algorithm: 'RS256' };
        verifyOptions: { algorithms: ['RS256'] };
      } => {
        const privateKey = _normalizePem(process.env.JWT_PRIVATE_KEY ?? '');
        const publicKey = _normalizePem(process.env.JWT_PUBLIC_KEY ?? '');

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    AuthTokenService,
    AuthLockoutService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
