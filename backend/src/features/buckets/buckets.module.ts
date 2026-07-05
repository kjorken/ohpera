import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BucketsService } from './buckets.service';
import { BucketsController } from './buckets.controller';

@Module({
  imports: [PassportModule],
  controllers: [BucketsController],
  providers: [BucketsService],
})
export class BucketsModule {}
