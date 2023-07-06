import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateAssignmentDto {
  @IsUrl()
  source: string;
  @IsOptional()
  @IsString()
  status: 'done' | 'under review' | 'ask feedback';
  @IsOptional()
  @IsString()
  comment: string;
  @IsUUID('4')
  task: string;
}
