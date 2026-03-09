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

  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors();

  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Task Manager API')
      .setDescription(
        `
      ## 📋 Task Manager REST API

      ### Authentication Flow
      1. \`POST /auth/register\` or \`POST /auth/login\` → get \`accessToken\` + \`refreshToken\`
      2. Attach \`accessToken\` to header: \`Authorization: Bearer <accessToken>\`
      3. when access token expire → \`POST /auth/refresh\` and \`refreshToken\`
      4. \`POST /auth/logout\` to invalidate refresh token

      ### Token TTL
      | Token | TTL |
      |-------|-----|
      | Access Token | 15m |
      | Refresh Token | 7d |
      `.trim(),
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Register, login, logout, refresh token')
      .addTag('projects', 'Manage projects')
      .addTag('tasks', 'Manage tasks within projects')

      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )

      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'refresh-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

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

  await app.listen(port);
  console.log(`\n🚀 Server running on: http://localhost:${port}/${prefix}`);
  console.log(`📋 Environment:       ${env}\n`);
}
bootstrap();
