import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Adaptador WebSocket puro (ws)
  app.useWebSocketAdapter(new WsAdapter(app));

  // 2. Interceptores, Filtros y Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AppExceptionFilter());

  // 3. CORS
  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Device-Id',
      'Client-Version',
      'X-Request-Id',
      'Accept',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // 4. Configuración de Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('AppFlowy Cloud API (NestJS)')
    .setDescription(
      'Clon completo y moderno del backend de AppFlowy Cloud en NestJS con TypeScript y documentación Swagger interactiva. Soporta Web, Desktop y Mobile.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingresa tu JWT token obtenido en /gotrue/token o /gotrue/signup',
    })
    .addTag('System', 'Health checks e información del servidor (/health, /api/server)')
    .addTag('Auth (GoTrue)', 'Autenticación, registro, login y sesiones (/gotrue/*)')
    .addTag('User', 'Perfil de usuario y listado de espacios (/api/user/*)')
    .addTag('Workspaces', 'Gestión de espacios de trabajo y miembros (/api/workspace/*)')
    .addTag('Pages & Views', 'Gestión de documentos, carpetas, vistas y papelera (/api/workspace/:id/page-view/*)')
    .addTag('Collab', 'Sincronización colaborativa CRDT, Yjs y WS (/api/workspace/:id/collab/*)')
    .addTag('File Storage', 'Almacenamiento de archivos S3/MinIO (/api/file_storage/*)')
    .addTag('Quick Notes', 'Notas rápidas sincronizadas (/api/workspace/:id/quick-note/*)')
    .addTag('Template Center', 'Centro de plantillas, creadores y categorías (/api/template-center/*)')
    .addTag('Chat', 'Sesiones de chat y mensajes (/api/chat/:workspace_id/*)')
    .addTag('AI', 'Generación de texto, streaming SSE y herramientas AI (/api/ai/:workspace_id/*)')
    .addTag('Search', 'Búsqueda de documentos y resumen inteligente (/api/search/*)')
    .addTag('Admin Console', 'Administración de usuarios, métricas globales, workspaces y SSO (/api/admin/*)')
    .addTag('Mailer', 'Servicio de correo saliente SMTP y fallback interactivo de consola (/api/mailer/*)')
    .addTag('Worker', 'Worker en segundo plano para indexación vectorial pgvector y mantenimiento (/api/worker/*)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AppFlowy Cloud API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Servidor AppFlowy NestJS corriendo en: http://localhost:${port}`);
  logger.log(`📚 Documentación Swagger interactiva: http://localhost:${port}/api/docs`);
}

bootstrap();
