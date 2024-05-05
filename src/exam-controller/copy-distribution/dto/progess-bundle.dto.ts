import { IsBoolean, IsString } from 'class-validator';

export class ProgressBundleDto {
  @IsString()
  bundle_id: string;

  @IsString()
  batch: string;

  @IsString()
  program: string;
}

export class BatchSubmitUpdateDto {
  @IsString()
  bundle_id: string;

  @IsString()
  batch: string;

  @IsString()
  program: string;

  @IsBoolean()
  answersheet: boolean;

  @IsBoolean()
  award_softcopy: boolean;

  @IsBoolean()
  award_hardcopy: boolean;
}
