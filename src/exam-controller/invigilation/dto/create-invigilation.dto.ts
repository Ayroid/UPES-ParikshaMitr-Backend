import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvigilationDto {}

export class AddDutyDto {
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @IsNotEmpty()
  @IsString()
  slot_id: string;
}
