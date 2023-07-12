import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateFeedbackDto {
  @IsUUID()
  id: string;
  @IsOptional()
  @IsString()
  comment?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  DS?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  QDS?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  budget?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  satisfaction?: number;
}
