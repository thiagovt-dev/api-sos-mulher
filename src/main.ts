import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyStatic from '@fastify/static';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    cors: true,
  });

app.register(fastifyStatic, {
  root: join(process.cwd(), 'public'), 
  prefix: '/public/',
});


  // Prefixo global
  app.setGlobalPrefix('api');

  // Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 4000;

  setupSwagger(app);

  await app.listen(port, '0.0.0.0');
  console.log(`API rodando em http://localhost:${port}/api`);
  console.log(`Docs em http://localhost:${port}/api/docs`);
}
bootstrap();
