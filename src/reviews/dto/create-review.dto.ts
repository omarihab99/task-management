import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  DS: number;
  @IsInt()
  @Min(1)
  @Max(5)
  QDS: number;
  @IsOptional()
  @IsString()
  comment?: string;
  @IsUUID()
  assignment: string;
}
