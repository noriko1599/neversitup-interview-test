import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { EventstoreDBTransportStrategy } from '@app/shared/eventstoredb.transport';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductModule,
    {
      strategy: new EventstoreDBTransportStrategy({
        connectionString: 'esdb://localhost:2113?tls=false',
        commandStream: 'command-product',
        eventStream: '$ce-product',
        group: 'services',
      }),
    },
  );
  app.listen();
}
bootstrap();
