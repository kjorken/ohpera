import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
