import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './features/auth/auth.module';
import { PayablesModule } from './features/payables/payables.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PayablesModule,
  ],
})
export class AppModule {}
