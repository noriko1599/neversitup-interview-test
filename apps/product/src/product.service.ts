import { Product } from '@app/shared/entities/product/product.entity';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, DeepPartial, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ReserveProductItemDTO } from '@app/shared/dto/product/reserve-product.dto';
import { EventstoreDBAppClient } from '@app/shared/eventstoredb.client';
import { jsonEvent } from '@eventstore/db-client';
import {
  ProductCreatedPattern,
  ProductCreatedPayload,
} from '@app/shared/events/product/product-created.event';
import { v4 as uuid } from 'uuid';
import { CreateOrderRequestedPayload } from '@app/shared/events/order/create-order-requested.event';
import {
  ProductQuantityReservationForOrderFailedPattern,
  ProductQuantityReservationForOrderFailedPayload,
} from '@app/shared/events/product/product-quantity-reservation-for-order-failed.event';
import {
  ProductQuantityReservedForOrderPattern,
  ProductQuantityReservedForOrderPayload,
} from '@app/shared/events/product/product-quantity-reserved-for-order.event';

@Injectable()
export class ProductService implements OnModuleInit {
  readonly client!: EventstoreDBAppClient;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private connection: Connection,
  ) {
    this.client = new EventstoreDBAppClient(`esdb://localhost:2113?tls=false`);
  }

  getProductRepository() {
    return this.productRepository;
  }

  async onModuleInit() {
    // await this.populateSampleDataIfNotExist();
  }

  getEventstoreDBStreamName(id: number) {
    return `product-${id}`;
  }

  getEventstoreDBOrderStreamName(orderId: number) {
    return `order-${orderId}`;
  }

  async populateSampleDataIfNotExist() {
    // const count = await this.productRepository.count();

    // if (count > 0) {
    //   return;
    // }

    // const samples: Product[] = Array.from({ length: 1 }).map(() => {
    //   return this.productRepository.create({
    //     sku: faker.string.uuid(),
    //     name: faker.commerce.productName(),
    //     price: Number(faker.commerce.price({ min: 100, max: 100_000 })),
    //     stock: faker.number.int({ min: 10, max: 100 }),
    //   });
    // });

    const product = this.productRepository.create({
      sku: faker.string.uuid(),
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price({ min: 100, max: 100_000 })),
      stock: faker.number.int({ min: 10, max: 100 }),
    });

    await this.create(product);
  }

  async create(payload: DeepPartial<Product>) {
    const product = this.productRepository.create(payload);
    const createdProduct = await this.productRepository.save(product);

    const event = this.client.createEvent<ProductCreatedPayload>(
      ProductCreatedPattern,
      {
        createdProduct,
      },
    );
    this.client.emit(this.getEventstoreDBStreamName(createdProduct.id), event);

    return createdProduct;
  }

  async reserveProducts(payload: CreateOrderRequestedPayload) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const failedProducts = [];
    const reservedProducts = [];

    try {
      const { requestedData, orderId } = payload;
      const { items } = requestedData;
      for (const item of items) {
        const product = await queryRunner.manager.findOneBy(Product, {
          id: item.productId,
        });

        if (!product || product.stock < item.quantity) {
          failedProducts.push({
            productId: item.productId,
            reason: !product ? 'Product not found' : 'Insufficient stock',
          });
        } else {
          product.stock -= item.quantity;
          await queryRunner.manager.save(product);
          reservedProducts.push({
            product,
            reservedQuantity: item.quantity,
          });
        }
      }

      if (failedProducts.length > 0) {
        await queryRunner.rollbackTransaction();

        const event =
          this.client.createEvent<ProductQuantityReservationForOrderFailedPayload>(
            ProductQuantityReservationForOrderFailedPattern,
            {
              orderId,
              failedProducts,
            },
          );

        this.client.emit(
          this.getEventstoreDBOrderStreamName(payload.orderId),
          event,
        );
      } else {
        await queryRunner.commitTransaction();

        const event =
          this.client.createEvent<ProductQuantityReservedForOrderPayload>(
            ProductQuantityReservedForOrderPattern,
            {
              orderId,
              reservedProducts,
            },
          );

        this.client.emit(
          this.getEventstoreDBOrderStreamName(payload.orderId),
          event,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      failedProducts,
      reservedProducts,
    };
  }
}
