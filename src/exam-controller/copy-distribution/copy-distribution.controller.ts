import { Body, Controller, Post } from '@nestjs/common';
import { CopyDistributionService } from './copy-distribution.service';
import { AddBundlesDto } from './dto/add-bundles.dto';

@Controller('exam-controller/copy-distribution')
export class CopyDistributionController {
  constructor(
    private readonly copyDistributionService: CopyDistributionService,
  ) {}

  @Post('add-bundles')
  async addBundles(@Body() addBundlesDto: AddBundlesDto) {
    return this.copyDistributionService.addBundles(addBundlesDto);
  }
}
