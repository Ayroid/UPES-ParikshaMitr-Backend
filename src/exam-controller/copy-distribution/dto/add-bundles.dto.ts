import { IsString } from 'class-validator';

export class AddBundlesDto {
  @IsString()
  dateOfExam: string;

  @IsString()
  evaluationMode: string;

  @IsString()
  evaluatorSap: string;

  @IsString()
  evaluatorName: string;

  @IsString()
  evaluatorSchool: string;

  @IsString()
  subjectCode: string;

  @IsString()
  subjectName: string;

  @IsString()
  noOfStudents: string;

  @IsString()
  program: string;

  @IsString()
  batch: string;
}
