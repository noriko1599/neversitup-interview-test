import { Product } from '@app/shared/entities/product/product.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import {
  ReserveProductDTO,
  ReserveProductItemDTO,
} from '@app/shared/dto/product/reserve-product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private connection: Connection,
  ) {}

  getProductRepository() {
    return this.productRepository;
  }

  async onModuleInit() {
    await this.populateSampleDataIfNotExist();
  }

  async populateSampleDataIfNotExist() {
    const count = await this.productRepository.count();

    if (count > 0) {
      return;
    }

    const samples: Product[] = Array.from({ length: 100 }).map(() => {
      return this.productRepository.create({
        sku: faker.string.uuid(),
        name: faker.commerce.productName(),
        price: Number(faker.commerce.price({ min: 100, max: 100_000 })),
        stock: faker.number.int({ min: 10, max: 100 }),
      });
    });

    await this.productRepository.save(samples);
  }

  async reserveProducts(items: ReserveProductItemDTO[]) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const failedReservations = [];
    const successfulReservations = [];

    try {
      for (const item of items) {
        const product = await queryRunner.manager.findOneBy(Product, {
          id: item.productId,
        });

        if (!product || product.stock < item.quantity) {
          failedReservations.push({
            productId: item.productId,
            reason: !product ? 'Product not found' : 'Insufficient stock',
          });
        } else {
          product.stock -= item.quantity;
          await queryRunner.manager.save(product);
          successfulReservations.push({
            product,
            reservedQuantity: item.quantity,
          });
        }
      }

      if (failedReservations.length > 0) {
        await queryRunner.rollbackTransaction();
      } else {
        await queryRunner.commitTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return { failedReservations, successfulReservations };
  }
}
