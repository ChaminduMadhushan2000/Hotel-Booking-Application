import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

interface SuccessEnvelope<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: true;
  message: string;
  data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveMessage(payload: unknown): string {
  if (isRecord(payload) && typeof payload.message === 'string') {
    const message = payload.message.trim();
    if (message.length > 0) {
      return message;
    }
  }
  return 'Request successful';
}

function resolveData(payload: unknown): unknown {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessEnvelope<unknown>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessEnvelope<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((payload: T) => ({
        statusCode: response.statusCode ?? 200,
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? request.url,
        method: request.method,
        success: true,
        message: resolveMessage(payload),
        data: resolveData(payload),
      })),
    );
  }
}
