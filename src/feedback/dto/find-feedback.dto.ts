import { IsUUID } from 'class-validator';

export class FindFeedbackDto {
  @IsUUID()
  id: string;
}
