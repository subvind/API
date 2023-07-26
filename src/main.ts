import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  console.log('NODE_ENV', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.production.env' });
  } else {
    dotenv.config({ path: '.development.env' });
  }

  console.log('POSTGRES_USER', process.env.POSTGRES_USER)
  console.log('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD)

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
