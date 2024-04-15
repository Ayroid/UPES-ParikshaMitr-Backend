import { Test, TestingModule } from '@nestjs/testing';
import { CopyDistributionService } from './copy-distribution.service';

describe('CopyDistributionService', () => {
  let service: CopyDistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CopyDistributionService],
    }).compile();

    service = module.get<CopyDistributionService>(CopyDistributionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
