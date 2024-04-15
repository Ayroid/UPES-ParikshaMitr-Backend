import { IsString } from 'class-validator';

export class ProgressBundleDto {
  @IsString()
  bundle_id: string;

  @IsString()
  batch: string;

  @IsString()
  program: string;
}
