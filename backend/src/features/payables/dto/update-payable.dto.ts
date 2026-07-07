import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePayableDto } from './create-payable.dto';

export class UpdatePayableDto extends PartialType(CreatePayableDto) {
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
