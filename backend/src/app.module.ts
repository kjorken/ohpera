import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { PayablesModule } from './features/payables/payables.module';
import { CategoriesModule } from './features/categories/categories.module';
import { SettingsModule } from './features/settings/settings.module';
import { HealthModule } from './features/health/health.module';
import { BucketsModule } from './features/buckets/buckets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    PayablesModule,
    CategoriesModule,
    SettingsModule,
    HealthModule,
    BucketsModule,
  ],
})
export class AppModule {}
