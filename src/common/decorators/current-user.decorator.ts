import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface UserContext {
  id: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserContext | null => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (
      typeof user === 'object' &&
      user !== null &&
      'id' in user &&
      'email' in user &&
      'role' in user
    ) {
      const value = user as Record<string, unknown>;
      if (
        typeof value.id === 'string' &&
        typeof value.email === 'string' &&
        typeof value.role === 'string'
      ) {
        return { id: value.id, email: value.email, role: value.role };
      }
    }

    return null;
  },
);
