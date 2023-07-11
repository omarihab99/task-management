import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsUUID()
  id: string;
  @IsOptional()
  @Min(1)
  @Max(5)
  DS?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  QDS: number;
  @IsOptional()
  @IsString()
  comment?: string;
}
