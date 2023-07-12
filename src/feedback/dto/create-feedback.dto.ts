import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  comment: string;
  @IsInt()
  @Min(1)
  @Max(5)
  DS: number;
  @IsInt()
  @Min(1)
  @Max(5)
  QDS: number;
  @IsInt()
  @Min(1)
  @Max(5)
  budget: number;
  @IsInt()
  @Min(1)
  @Max(5)
  satisfaction: number;
  @IsUUID()
  assignment: string;
}
