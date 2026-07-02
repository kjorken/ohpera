import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { RecurrenceFrequency } from '../../payables/dto/create-payable.dto';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  defaultReminderDays?: number;

  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  bucketFrequency?: RecurrenceFrequency;

  @IsOptional()
  @IsDateString()
  bucketCycleStart?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  bucketCustomDays?: number;
}
