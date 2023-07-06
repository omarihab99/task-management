import { IsUUID } from 'class-validator';

export class FindAssignmentDto {
  @IsUUID('4')
  id: string;
}
