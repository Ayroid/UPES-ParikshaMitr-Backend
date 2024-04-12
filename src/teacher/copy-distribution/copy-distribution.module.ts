import { Module } from '@nestjs/common';
import { CopyDistributionService } from './copy-distribution.service';
import { CopyDistributionController } from './copy-distribution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CopyBundle, CopyBundleSchema } from '../../schemas/sheet-bundle';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CopyBundle.name, schema: CopyBundleSchema },
      { name: Teacher.name, schema: TeacherSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [CopyDistributionController],
  providers: [CopyDistributionService],
})
export class CopyDistributionModule {}
