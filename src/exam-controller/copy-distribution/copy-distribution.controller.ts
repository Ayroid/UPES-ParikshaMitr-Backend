import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CopyDistributionService } from './copy-distribution.service';
import { AddBundlesDto } from './dto/add-bundles.dto';
import { ExamContGuard } from '../../guards/cont-guard.guard';
import { ProgressBundleDto } from './dto/progess-bundle.dto';
import { TeacherJwtGuard } from '../../guards/teacher-jwt.guard';

@Controller('exam-controller/copy-distribution')
export class CopyDistributionController {
  constructor(
    private readonly copyDistributionService: CopyDistributionService,
  ) {}

  @UseGuards(ExamContGuard)
  @Post('add-bundles')
  async addBundles(@Body() addBundlesDto: AddBundlesDto) {
    return this.copyDistributionService.addBundles(addBundlesDto);
  }

  @UseGuards(ExamContGuard)
  @Get('all-bundles')
  async allBundles() {
    return this.copyDistributionService.allBundles();
  }

  @UseGuards(ExamContGuard)
  @Get('bundle-by-id')
  async getBundle(@Query('bundle_id') id: string) {
    return this.copyDistributionService.getBundle(id);
  }

  @UseGuards(ExamContGuard)
  @Patch('progress-bundle')
  async progressBundle(@Body() progressBundleDto: ProgressBundleDto) {
    return this.copyDistributionService.progressBundle(progressBundleDto);
  }

  @UseGuards(TeacherJwtGuard)
  @Patch('accept-bundle')
  async acceptBundle(@Body() progressBundleDto: ProgressBundleDto, @Req() req) {
    return this.copyDistributionService.acceptBundle(
      progressBundleDto,
      req?.user?.id,
    );
  }
}
