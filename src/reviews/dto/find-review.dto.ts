import { IsUUID } from 'class-validator';

export class FindReviewDto {
  @IsUUID()
  id: string;
}
