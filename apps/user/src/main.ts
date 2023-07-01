import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { EventstoreDBTransportStrategy } from '@app/shared/eventstoredb.transport';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      strategy: new EventstoreDBTransportStrategy({
        connectionString: 'esdb://localhost:2113?tls=false',
        commandStream: 'command-user',
        eventStream: '$ce-user',
        group: 'services',
      }),
    },
  );
  app.listen();
}
bootstrap();
