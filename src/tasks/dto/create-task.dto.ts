import {
  IsDateString,
  IsInt,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @Length(3)
  title: string;
  @IsString()
  @Length(3)
  topic: string;
  @IsInt()
  @IsPositive()
  sprint: number;
  @IsDateString()
  deadlineAt: string;
}
