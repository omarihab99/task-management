import { IsUUID } from 'class-validator';

export class FindTaskDto {
  @IsUUID('4')
  id: string;
}
