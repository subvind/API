import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  console.log('NODE_ENV', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'production') {
    // railway secrets:set RABBITMQ=VALUE
    // railway secrets:set POSTGRESQL=VALUE
  } else {
    dotenv.config({ path: '.development.env' });
    process.env.RABBITMQ = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:5672`
  }


  console.log('POSTGRES_USER', process.env.POSTGRES_USER)
  console.log('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD)

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
