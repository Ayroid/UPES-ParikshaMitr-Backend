import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CopyDistributionService } from './copy-distribution.service';
import { AddBundlesDto } from './dto/add-bundles.dto';
import { ExamContGuard } from '../../guards/cont-guard.guard';
import { TeacherJwtGuard } from '../../guards/teacher-jwt.guard';

@Controller('teacher/copy-distribution')
export class CopyDistributionController {
  constructor(
    private readonly copyDistributionService: CopyDistributionService,
  ) {}

  @UseGuards(TeacherJwtGuard)
  @Get('bundles')
  async teacherBundles(@Req() req) {
    return this.copyDistributionService.teacherBundles(req?.user?.id);
  }
}
