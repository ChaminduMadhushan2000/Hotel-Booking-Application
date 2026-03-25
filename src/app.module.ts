import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { HealthModule } from './modules/health/health.module';
import { PlatformModule } from './modules/platform/platform.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { UsersModule } from './modules/users/users.module';
import { configuration, envValidationSchema } from './config/configuration';
import { EmailProcessor } from './queues/processors/email.processor';
import { ImageProcessor } from './queues/processors/image.processor';
import { EMAIL_QUEUE, IMAGE_QUEUE } from './common/constants/queue.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: false, abortEarly: true },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): { connection: { host: string; port: number } } => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379,
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: EMAIL_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
      {
        name: IMAGE_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
    ),
    AuditModule,
    AuthModule,
    BookingsModule,
    HealthModule,
    PlatformModule,
    RoomsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'hotel_booking',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
  ],
  providers: [EmailProcessor, ImageProcessor],
})
export class AppModule {}
