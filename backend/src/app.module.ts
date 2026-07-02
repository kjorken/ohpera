import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { PayablesModule } from './features/payables/payables.module';
import { CategoriesModule } from './features/categories/categories.module';
import { SettingsModule } from './features/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PayablesModule,
    CategoriesModule,
    SettingsModule,
  ],
})
export class AppModule {}
