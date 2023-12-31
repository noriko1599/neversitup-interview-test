import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { EventstoreDBTransportStrategy } from '@app/shared/eventstoredb.transport';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductModule,
    {
      strategy: new EventstoreDBTransportStrategy({
        connectionString: 'esdb://localhost:2113?tls=false',
        group: 'product-service',
        category: 'product',
      }),
    },
  );
  app.listen();

  const httpApp = await NestFactory.create(ProductModule);
  httpApp.useGlobalPipes(new ValidationPipe());
  httpApp.listen(3002);
}
bootstrap();
