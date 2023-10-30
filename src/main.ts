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
  app.enableCors({
    origin: '*',
  });

  // Create a Swagger document builder
  const options = new DocumentBuilder()
    .setTitle('Headless API')
    .setDescription(`We understand that your business is unique, and your technology should reflect that. That's why we offer a fully customizable solution that empowers you to mold your digital environment to align perfectly with your brand and objectives. Whether it's the user interface, workflow automation, or data integrations, you have the freedom to adapt and evolve your platform as your business evolves, ensuring it remains a true reflection of your vision and goals. With full customization at your fingertips, you're in control of your digital destiny.`)
    .setVersion('1.0')
    .build();

  // Create a Swagger document and configure the UI
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
