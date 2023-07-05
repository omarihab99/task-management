import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsUUID()
  cordinator?: string;
}
