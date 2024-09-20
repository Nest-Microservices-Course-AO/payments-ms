import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const logger = new Logger('Payments-Main');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: { servers: envs.NATS_SERVERS },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();
  await app.listen(envs.PORT);
  console.log('Health check configured');
  logger.log(`Server is running on: ${envs.PORT}`);
}
bootstrap();
