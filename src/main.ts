import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const prefix = configService.get<string>('app.prefix') || 'api/v1';
  const env = configService.get<string>('app.env');

  // Global prefix
  app.setGlobalPrefix(prefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS
  app.enableCors();

  // ─── Swagger ────────────────────────────────────────────────────────────────
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Task Manager API')
      .setDescription(
        `
      ## 📋 Task Manager REST API

      Manage your **projects** and **tasks** with ease.

      ### Features
      - Full CRUD for Projects and Tasks
      - Task status transition validation
      - Filter & search support
      - Standardized response format

      ### Response Format
      All endpoints return a unified response wrapper:
      \`\`\`json
      {
        "success": true,
        "data": { ... },
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
      \`\`\`

      ### Error Format
      \`\`\`json
      {
        "statusCode": 400,
        "timestamp": "2024-01-01T00:00:00.000Z",
        "path": "/api/v1/tasks",
        "method": "POST",
        "message": "Validation failed"
      }
      \`\`\`
      `.trim(),
      )
      .setVersion('1.0.0')
      .addTag('projects', 'Manage projects — create, read, update, delete')
      .addTag('tasks', 'Manage tasks within projects')
      // .addBearerAuth() // uncomment later when add Auth
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Task Manager API Docs',
    });

    console.log(`📖 Swagger UI:        http://localhost:${port}/docs`);
    console.log(`📄 Swagger JSON:      http://localhost:${port}/docs-json`);
  }
  // ────────────────────────────────────────────────────────────────────────────

  await app.listen(port);
  console.log(`\n🚀 Server running on: http://localhost:${port}/${prefix}`);
  console.log(`📋 Environment:       ${env}\n`);
}
bootstrap();
