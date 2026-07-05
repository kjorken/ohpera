import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  CurrentUser,
  AuthUser,
} from '../../shared/common/current-user.decorator';
import { BucketsService, BucketCycleResponse } from './buckets.service';

@Controller('buckets')
@UseGuards(AuthGuard('jwt'))
export class BucketsController {
  constructor(private readonly service: BucketsService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthUser): Promise<BucketCycleResponse> {
    return this.service.getCurrentCycle(user.id);
  }
}
