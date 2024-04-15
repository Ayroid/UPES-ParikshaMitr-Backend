import { Module } from '@nestjs/common';
import { CopyDistributionService } from './copy-distribution.service';
import { CopyDistributionController } from './copy-distribution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CopyBundle, CopyBundleSchema } from '../../schemas/sheet-bundle';
import { Teacher, TeacherSchema } from '../../schemas/teacher.schema';
import { ExamController } from '../entities/exam-controller.entity';
import { ExamControllerSchema } from '../../schemas/exam-controller.schema';
import { Slot, SlotSchema } from '../../schemas/slot.schema';
import { Room, RoomSchema } from '../../schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CopyBundle.name, schema: CopyBundleSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: ExamController.name, schema: ExamControllerSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Slot.name, schema: SlotSchema },
      { name: Room.name, schema: RoomSchema },
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
