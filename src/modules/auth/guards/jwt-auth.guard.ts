import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = super.canActivate(context);

    if (typeof result === 'boolean') {
      return result;
    }

    if (result instanceof Promise) {
      return result;
    }

    throw new UnauthorizedException('Unable to evaluate authentication guard');
  }
}
