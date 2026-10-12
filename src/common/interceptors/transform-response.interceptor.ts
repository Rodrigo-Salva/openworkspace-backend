import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, AppResponseDto<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AppResponseDto<T> | T> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    // Endpoints de GoTrue (/gotrue/*) tienen su propio formato estándar de Supabase
    if (req.url && req.url.startsWith('/gotrue')) {
      return next.handle();
    }

    // Endpoints binarios o Swagger no se envuelven
    if (
      (res.getHeader('content-type') &&
        typeof res.getHeader('content-type') === 'string' &&
        res.getHeader('content-type').includes('application/octet-stream')) ||
      (req.url && req.url.includes('/api/docs'))
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Si ya viene formateado con 'code', no lo re-envolvemos
        if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
          return data;
        }

        return {
          code: 0,
          message: 'Ok',
          data: data !== undefined ? data : null,
        };
      }),
    );
  }
}
