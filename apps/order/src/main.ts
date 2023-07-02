import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { EventstoreDBTransportStrategy } from '@app/shared/eventstoredb.transport';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      strategy: new EventstoreDBTransportStrategy({
        connectionString: 'esdb://localhost:2113?tls=false',
        commandStream: 'command-order',
        eventStream: '$ce-order',
        group: 'services',
      }),
    },
  );
  app.listen();

  const httpApp = await NestFactory.create(OrderModule);
  httpApp.useGlobalPipes(new ValidationPipe());
  await httpApp.listen(3001);
}
bootstrap();
