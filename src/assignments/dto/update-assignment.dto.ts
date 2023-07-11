import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class UpdateAssignmentDto {
  @IsUUID()
  id: string;
  @IsOptional()
  @IsUrl()
  source?: string;
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateStatusDto {
  id: string;
  status: 'done' | 'under review' | 'ask feedback';
}
