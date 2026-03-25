import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorEnvelope {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: false;
  message: string;
  data: null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickMessage(exceptionResponse: unknown): string {
  if (
    typeof exceptionResponse === 'string' &&
    exceptionResponse.trim().length > 0
  ) {
    return exceptionResponse.trim();
  }

  if (isRecord(exceptionResponse)) {
    const rawMessage = exceptionResponse.message;

    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
      return rawMessage.trim();
    }

    if (Array.isArray(rawMessage)) {
      const messages = rawMessage.filter(
        (value): value is string =>
          typeof value === 'string' && value.trim().length > 0,
      );
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }
  }

  return 'Request failed';
}

function sanitizeErrorMessage(message: string, statusCode: number): string {
  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'Internal server error';
  }

  const normalized = message.toLowerCase();
  const blockedTerms = [
    'stack',
    'query failed',
    'sql',
    'database',
    'postgres',
    'typeorm',
    'constraint',
    'duplicate key',
  ];

  if (blockedTerms.some((term) => normalized.includes(term))) {
    return 'Request failed';
  }

  return message.length > 0 ? message : 'Request failed';
}

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? pickMessage(exception.getResponse())
        : 'Internal server error';

    const payload: ErrorEnvelope = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.originalUrl ?? request.url,
      method: request.method,
      success: false,
      message: sanitizeErrorMessage(rawMessage, statusCode),
      data: null,
    };

    response.status(statusCode).json(payload);
  }
}
