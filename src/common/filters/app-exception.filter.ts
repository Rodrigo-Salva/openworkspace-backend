import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 1000;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || (res as any).error || message;
        errorCode = (res as any).code || status;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error at ${request.url}:`, exception.stack);
    }

    // Para GoTrue retornamos el formato estándar de GoTrue / Supabase
    if (request.url && request.url.startsWith('/gotrue')) {
      return response.status(status).json({
        code: status,
        msg: message,
        error_code: String(errorCode),
      });
    }

    // Para la API normal de AppFlowy:
    response.status(status).json({
      code: errorCode,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
    });
  }
}
