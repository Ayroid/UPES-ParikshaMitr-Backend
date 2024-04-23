import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher, TeacherDocument } from '../../schemas/teacher.schema';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from '../../schemas/schedule.schema';
import { AddEventDto } from '../dto/add-event.dto';
import { AddTeacherToEventDto } from '../dto/add-teacher-to-event.dto';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import {
  RoomInvigilator,
  RoomInvigilatorDocument,
} from '../../schemas/room-invigilator.schema';
import { Room, RoomDocument } from '../../schemas/room.schema';
import { ChangePasswordDto } from '../dto/change-password.dto';
import {
  FlyingSquad,
  FlyingSquadDocument,
} from '../../schemas/flying-squad.schema';
import { format } from 'date-fns';

@Injectable()
export class ContTeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    @InjectModel(RoomInvigilator.name)
    private roomInvigilatorModel: Model<RoomInvigilatorDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
  ) {}

  async findApproved() {
    const teachers = await this.teacherModel.find({
      approved: true,
    });

    return teachers.map((teacher) => ({
      _id: teacher._id,
      sap_id: teacher.sap_id,
      name: teacher.name,
      approved: teacher.approved,
      onboardedAt: (teacher as any).createdAt,
      phone: teacher.phone,
      email: teacher.email,
    }));
  }

  async findUnapprovedTeachers() {
    const teachers = await this.teacherModel.find({ approved: false });

    //everything except the password
    return teachers.map((teacher) => ({
      _id: teacher._id,
      sap_id: teacher.sap_id,
      name: teacher.name,
      onboardedAt: (teacher as any).createdAt,
      phone: teacher.phone,
      email: teacher.email,
    }));
  }

  async approveTeacher(id: string) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        return {
          message: 'Teacher not found',
        };
      }
      if (teacher.approved) {
        return {
          message: 'Teacher already approved',
        };
      }
      teacher.approved = true;
      teacher.save();
      return {
        message: 'Teacher approved successfully',
        data: {
          name: teacher.name,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async disableTeacher(id: string) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        return {
          message: 'Teacher not found',
        };
      }
      if (!teacher.approved) {
        return {
          message: 'Teacher already disabled',
        };
      }
      teacher.approved = false;
      teacher.save();
      return {
        message: 'Teacher disabled successfully',
        data: {
          name: teacher.name,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async editTeacher(id: string, body: any) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        throw new HttpException(
          {
            message: 'Teacher not found',
          },
          404,
        );
      }
      if (teacher.approved) {
        throw new HttpException(
          {
            message: 'Approved teachers cannot be edited',
          },
          400,
        );
      }

      if (body.name) {
        teacher.name = body.name;
      }
      if (body.email) {
        teacher.email = body.email;
      }
      if (body.phone) {
        teacher.phone = body.phone;
      }

      await teacher.save();
      return {
        message: 'Teacher edited successfully',
        data: {
          name: teacher.name,
          phone: teacher.phone,
          email: teacher.email,
        },
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      if (err.name === 'ValidationError') {
        throw new HttpException(
          {
            message: err.message,
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: err,
        },
        500,
      );
    }
  }

  async getSchedule() {
    return await this.scheduleModel.find();
  }

  async addEvent(body: AddEventDto) {
    const newEvent = new this.scheduleModel(body);
    await newEvent.save();
    return {
      message: 'Event added successfully',
    };
  }

  async addTeacherToEvent(body: AddTeacherToEventDto) {
    try {
      const event = await this.scheduleModel.findById(body.event_id);
      if (!event) {
        throw new HttpException(
          {
            message: 'Event not found',
          },
          404,
        );
      }
      //event.participants add like a set

      (event.participants as any).addToSet(...body.teacher_ids);
      await event.save();
      return {
        message:
          'Teachers added to event "' + event.event_name + '" successfully',
      };
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new HttpException(
          {
            message: 'Invalid Teacher id',
          },
          400,
        );
      }

      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async getSlotAttendance() {
    const slots = await this.slotModel.find();
    const allTeachers = await this.teacherModel.find({
      approved: true,
    });

    const teacherAttendance = allTeachers.map((teacher) => {
      return {
        _id: teacher._id,
        teacher: teacher.name,
        sap_id: teacher.sap_id,
        attendance: [],
      };
    });

    // Each slot has set of rooms, and each room is connected to a roomInvigilator which has invigilator1 and invigilator2
    // We need to get the invigilator1 and invigilator2 and check if the teacher is present in the roomInvigilator
    // If present, then the teacher is present in the slot
    // slots.forEach((slot) => {
    //   slot?.rooms?.forEach((room) => {

    // This login in for loop so that it can be awaited

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      for (let j = 0; j < slot.rooms.length; j++) {
        const room = slot.rooms[j];
        const roomInvigilator = await this.roomInvigilatorModel.findOne({
          room_id: room,
        });
        if (roomInvigilator) {
          const teacher1 = roomInvigilator.invigilator1_id?.toString();
          const teacher2 = roomInvigilator.invigilator2_id?.toString();
          const teacher1Index = teacherAttendance.findIndex(
            (teacher) => teacher._id.toString() == teacher1,
          );
          const teacher2Index = teacherAttendance.findIndex(
            (teacher) => teacher._id.toString() == teacher2,
          );
          if (teacher1Index != -1) {
            teacherAttendance[teacher1Index].attendance.push({
              slot_date: slot.date,
              slot_type: slot.timeSlot,
              slot_id: slot._id,
              attendance: true,
            });
          }
          if (teacher2Index != -1) {
            teacherAttendance[teacher2Index].attendance.push({
              slot_date: slot.date,
              slot_type: slot.timeSlot,
              slot_id: slot._id,
              attendance: true,
            });
          }
        }
      }
    }

    // For all teachers, if the teacher is not present in the slot, then add the slot to the attendance with attendance as false
    teacherAttendance.forEach((teacher) => {
      slots.forEach((slot) => {
        const slotIndex = teacher.attendance.findIndex(
          (attendance) => attendance.slot_id.toString() == slot._id.toString(),
        );
        if (slotIndex == -1) {
          teacher.attendance.push({
            slot_date: slot.date,
            slot_type: slot.timeSlot,
            slot_id: slot._id,
            attendance: false,
          });
        }
      });
    });

    // Give all slots data grouped by date and timeSlot in array, format:
    // [{ date: { timeSlot: [slot1, slot2, ...] } }]

    const allSlotsData = slots.reduce((acc, slot) => {
      const d = acc.find((a) => a.date === slot.date);
      if (d) {
        const t = d.timeSlots.find((t) => t === slot.timeSlot);
        if (!t) {
          d.timeSlots.push(slot.timeSlot);
        }
      } else {
        acc.push({
          date: slot.date,
          timeSlots: [slot.timeSlot],
        });
      }
      return acc;
    }, []);
    return {
      message: 'Teacher attendance fetched successfully',
      data: {
        teacherAttendance,
        allSlotsData,
      },
    };
  }

  async deleteTeacher(id: string) {
    try {
      const teacher = await this.teacherModel.findById(id);
      if (!teacher) {
        throw new HttpException(
          {
            message: 'Teacher not found',
          },
          404,
        );
      }
      if (teacher.approved) {
        throw new HttpException(
          {
            message: 'Approved teachers cannot be deleted',
          },
          400,
        );
      }
      await teacher.deleteOne();
      return {
        message: 'Teacher deleted successfully',
      };
    } catch (err) {
      if (err.name === 'CastError') {
        throw new HttpException(
          {
            message: 'Invalid id',
          },
          400,
        );
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
        },
        500,
      );
    }
  }

  async changePassword(body: ChangePasswordDto) {
    const teacher = await this.teacherModel.findById(body.teacher_id);
    if (!teacher) {
      throw new HttpException(
        {
          message: 'Teacher not found',
        },
        404,
      );
    }

    const pass_hash = await bcrypt.hash(body.pass, 10);
    teacher.password = pass_hash;
    await teacher.save();
    return {
      message: 'Password changed successfully',
    };
  }

  async getDutyStatus(date: string, timeslot: string) {
    try {
      const slot = await this.slotModel.findOne({
        date: date,
        timeSlot: timeslot,
      });

      if (!slot) {
        throw new HttpException(
          {
            message: 'Slot not found',
          },
          404,
        );
      }

      const flying = await this.flyingSquadModel
        .find({
          slot: slot._id,
        })
        .populate('teacher_id', 'name sap_id phone email');

      const invigilators_list = slot.inv_duties;

      const res_invigilators = [];

      for (let i = 0; i < invigilators_list.length; i++) {
        const invigilator = invigilators_list[i];
        const teacher = await this.teacherModel.findById(invigilator);
        const inv = await this.roomInvigilatorModel
          .findOne({
            room_id: { $in: slot.rooms },
            $or: [
              {
                invigilator1_id: invigilator,
              },
              {
                invigilator2_id: invigilator,
              },
              {
                invigilator3_id: invigilator,
              },
            ],
          })
          .populate('room_id', 'room_no');
        res_invigilators.push({
          Name: teacher.name,
          sap_id: teacher.sap_id,
          phone: teacher.phone,
          email: teacher.email,
          room: (inv?.room_id as any)?.room_no,
          inv_id: invigilator,
          scan_time:
            inv?.invigilator1_id.toString() == invigilator
              ? format(inv?.invigilator1_assign_time, 'hh:mm aa')
              : inv?.invigilator2_id.toString() == invigilator
              ? format(inv?.invigilator2_assign_time, 'hh:mm aa')
              : inv?.invigilator3_id.toString() == invigilator
              ? format(inv?.invigilator3_assign_time, 'hh:mm aa')
              : null,
          attendance: !!inv,
        });
      }

      return {
        message: 'Duty status fetched successfully',
        // data: slot,
        flying: flying.map((ele) => ({
          Name: (ele.teacher_id as any)?.name,
          sap_id: (ele.teacher_id as any)?.sap_id,
          phone: (ele.teacher_id as any)?.phone,
          email: (ele.teacher_id as any)?.email,
          in_time: ele.in_time,
          out_time: ele.out_time,
          rooms: ele.rooms_assigned.length,
          status: ele.status,
          final_remarks: ele.final_remarks,
        })),
        invigilators: res_invigilators,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        {
          message: 'Something went wrong',
          error: err.message,
        },
        500,
      );
    }
  }
}
