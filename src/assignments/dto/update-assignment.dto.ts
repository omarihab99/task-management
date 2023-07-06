import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class UpdateAssignmentDto {
  @IsUUID()
  id: string;
  @IsOptional()
  @IsUrl()
  source: string;
  @IsOptional()
  @IsString()
  status: 'done' | 'under review' | 'ask feedback';
  @IsOptional()
  @IsString()
  comment: string;
}
