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

  async searchStudent(sap_id: string, ans_sheet_number: string, course: string, subject: string, subject_code: string, Slot: string) {
    try {
        if (!sap_id && !ans_sheet_number) {
            throw new HttpException('SAP ID or ANS SHEET No. is required', 400);
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

        if (ans_sheet_number) {
            ans_sheet_number = ans_sheet_number.toUpperCase();
            room = await this.roomModel
                .find(
                    { 'students.ans_sheet_number': ans_sheet_number },
                    {
                        students: {
                            $elemMatch: { ans_sheet_number },
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

        if (course) {
          room = await this.roomModel
            .find(
              { 'students.course': course },
              {
                students: {
                  $elemMatch: { course },
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

        if (Slot) {
            room = await this.roomModel
                .find(
                    { 'students.subject': subject, 'students.subject_code': subject_code },
                    {
                        students: {
                            $elemMatch: { subject, subject_code },
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

        const res: any[] = [
            ...room.map((room) =>
                room.students.map((student) => {
                    return {
                        _id: room._id,
                        room_no: room.room_no,
                        block: room.block,
                        invigilator1: room.room_invigilator_id.invigilator1_id,
                        invigilator2: room.room_invigilator_id.invigilator2_id,
                        invigilator3: room.room_invigilator_id.invigilator3_id,
                        student: student,
                    };
                }),
            ),
        ].flat();

        for (const r of res) {
            const slot = await this.slotModel.findOne(
                { rooms: r._id },
                'date timeSlot type',
            );
            r.slot = slot;
        }

        return {
            message: 'Student found',
            data: {
                sap_id: res[0]?.student?.sap_id,
                ans_sheet_number: res[0]?.student?.ans_sheet_number,
                name: res[0]?.student?.student_name,
                a: 'X',
                rooms: res.sort((a, b) =>
                    new Date(a.slot.date) < new Date(b.slot.date) ? 1 : -1,
                ),
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
    try{
    if (!sap_id) {
      throw new HttpException('SAP ID or Roll No is required', 400);
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


    const res: any[] = [
      ...room.map((room) =>
        room.students.map((student) => {
          return {
            _id: room._id,
            room_no: room.room_no,
            block: room.block,
            invigilator1: room.room_invigilator_id.invigilator1_id,
            invigilator2: room.room_invigilator_id.invigilator2_id,
            invigilator3: room.room_invigilator_id.invigilator3_id,
            student: student,
          };
        }),
      ),
    ].flat();

    for (const r of res) {
      const slot = await this.slotModel.findOne(
        { rooms: r._id },
        'date timeSlot type',
      );
      r.slot = slot;
    }

    return {
      message: 'Student found',
      data: {
        sap_id: res[0]?.student?.sap_id,
        roll_no: res[0]?.student?.roll_no,
        name: res[0]?.student?.student_name,
        a: 'X',
        rooms: res.sort((a, b) =>
          new Date(a.slot.date) < new Date(b.slot.date) ? 1 : -1,
        ),
      },
    };}catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }
}
