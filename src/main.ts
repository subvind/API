import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    // railway secrets:set RABBITMQ=VALUE
    // railway secrets:set POSTGRESQL=VALUE
  } else {
    dotenv.config({ path: '.development.env' });
    process.env['RABBITMQ'] = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:5672`
  }

  const app = await NestFactory.create(AppModule);

  // so browsers can use api
  app.enableCors();

  // Create a Swagger document builder
  const options = new DocumentBuilder()
    .setTitle('FlowERP')
    .setDescription('subvind backend API documentation')
    .setVersion('1.0')
    .build();

  // Create a Swagger document and configure the UI
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
