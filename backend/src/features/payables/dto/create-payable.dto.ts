import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
} from 'class-validator';
import { RecurrenceFrequency } from '../../../../generated/prisma/enums';

export { RecurrenceFrequency };

export class CreatePayableDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsBoolean()
  isRecurring: boolean;

  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsPositive()
  amountPerPeriod: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reminderDaysBefore: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
