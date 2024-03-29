import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from '../../schemas/room.schema';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { Model } from 'mongoose';

@Injectable()
export class StudentService {
constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async searchStudent(ans_sheet_number: number) {
    try {
      if (!ans_sheet_number) {
        throw new HttpException('ANS Sheet Number is required', 400);
      }

      const room = await this.roomModel
      .findOne(
        { 'students.ans_sheet_number': ans_sheet_number },
        {
          'students.$': 1,
          room_no: 1,
          block: 1,
          invigilator1_id: 1,
          invigilator2_id: 1,
          invigilator3_id: 1,
        }
      );

      if (!room || !room[0]) {
        throw new HttpException('Student not found', 404);
      }

      const student = room[0].students[0];

      const slot = await this.slotModel.findOne(
        { rooms: room[0]._id },
        'date timeSlot type',
      );

      return {
        message: 'Student found',
        data: {
          sap_id: student.sap_id,
          roll_no: student.roll_no,
          student_name: student.student_name,
          course: student.course,
          subject: student.subject,
          subject_code: student.subject_code,
          seat_no: student.seat_no,
          exam_type: student.exam_type,
          eligible: student.eligible,
          ans_sheet_number: student.ans_sheet_number,
          attendance: student.attendance,
          b_sheet_count: student.b_sheet_count,
          attendance_time: student.attendance_time,
          attendance_by: student.attendance_by,
          UFM: student.UFM,
          UFM_by: student.UFM_by,
          new_ans_sheet_number: student.new_ans_sheet_number,
          room_no: room[0].room_no,
          block: room[0].block,
          invigilator1: room[0].room_invigilator_id.invigilator1_id,
          invigilator2: room[0].room_invigilator_id.invigilator2_id,
          invigilator3: room[0].room_invigilator_id.invigilator3_id,
          slot: slot,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }
  async getStudentAttendanceBySapId(sap_id: string) {
    try {
      if (!sap_id) {
        throw new HttpException('SAP ID is required', 400);
      }

      let room;
    if (sap_id) {
      if (isNaN(parseInt(sap_id))) {
        throw new HttpException('Invalid SAP ID', 400);
      }

      room = await this.roomModel
        .find(
          { 'students.sap_id': sap_id },
          {
            students: {
              $elemMatch: { sap_id },
            },

            room_no: 1,
            room_invigilator_id: 1,
            block: 1,
          },
        )
        .populate({
          path: 'room_invigilator_id',
          select: {
            invigilator1_id: 1,
            invigilator2_id: 1,
            invigilator3_id: 1,
          },
          populate: [
            {
              path: 'invigilator1_id',
              select: { name: 1, sap_id: 1, email: 1, phone: 1 },
            },
            {
              path: 'invigilator2_id',
              select: { name: 1, sap_id: 1, email: 1, phone: 1 },
            },
            {
              path: 'invigilator3_id',
              select: { name: 1, sap_id: 1, email: 1, phone: 1 },
            },
          ],
        });
      if (room.length === 0) {
        throw new HttpException('Student not found', 404);
      }
    }


      const student = room.students.find((student) => student.sap_id === sap_id);

      if (!student) {
        throw new HttpException('Student not found', 404);
      }

      const slot = await this.slotModel.findOne(
        { rooms: room._id },
        'date timeSlot type',
      );

      return {
        message: 'Student attendance found',
        data: {
          sap_id: student.sap_id,
          attendance: student.attendance,
          room_no: room.room_no,
          block: room.block,
          slot: slot,
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }
}