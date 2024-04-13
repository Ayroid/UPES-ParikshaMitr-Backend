import { Injectable, HttpException, Inject, Logger } from '@nestjs/common';
import { CreateFlyingDto, DeleteFlyingDto } from './dto/create_flying.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  FlyingSquadDocument,
  FlyingSquad,
} from '../../schemas/flying-squad.schema';
import { Model } from 'mongoose';
import { Slot, SlotDocument } from '../../schemas/slot.schema';
import { AssignRoomsDto } from './dto/assign-rooms.dto';

@Injectable()
export class FlyingService {
  constructor(
    @InjectModel(FlyingSquad.name)
    private flyingSquadModel: Model<FlyingSquadDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async create(body: CreateFlyingDto) {
    try {
      const slot = await this.slotModel
        .findById(body.slot_id)
        .populate('flying_squad');

      if (!slot) {
        throw new HttpException('Slot not found', 404);
      }

      if (slot.inv_duties.includes(body.teacher_id)) {
        throw new HttpException(
          'Teacher already has invigilation duty in this slot',
          400,
        );
      }

      if (
        slot.flying_squad.filter(
          (f) => (f as any).teacher_id == body.teacher_id,
        ).length > 0
      ) {
        throw new HttpException(
          'Teacher already has flying squad duty in this slot',
          400,
        );
      }

      const flyingSquad = new this.flyingSquadModel({
        teacher_id: body.teacher_id,
        slot: body.slot_id,
      });
      await flyingSquad.save();
      slot.flying_squad.push(flyingSquad._id.toString());
      await slot.save();
      return {
        message: 'Flying squad member added successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async assignRooms(body: AssignRoomsDto) {
    try {
      const flyingSquad = await this.flyingSquadModel.findById(
        body.flying_squad_id,
      );
      if (!flyingSquad) {
        return {
          message: 'Flying squad member not found',
        };
      }
      if ((flyingSquad.rooms_assigned.length as any) == 0) {
        flyingSquad.rooms_assigned = body.room_ids.map((room) => ({
          room_id: room,
          status: 'assigned',
        })) as any;
      } else {
        (flyingSquad.rooms_assigned as any) = [
          ...flyingSquad.rooms_assigned,
          ...(body.room_ids.map((room) => ({
            room_id: room,
            status: 'assigned',
          })) as any),
        ];
      }

      await flyingSquad.save();
      return {
        message: 'Rooms assigned successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async getBySlot(slot_id: string) {
    try {
      return await this.flyingSquadModel
        .find({ slot: slot_id })
        .populate('rooms_assigned.room_id', 'room_no')
        .populate('teacher_id', 'name sap_id email phone');
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  async completeDuty(body: CreateFlyingDto) {
    try {
      const flyingSquad = await this.flyingSquadModel.findOne({
        teacher_id: body.teacher_id,
        slot: body.slot_id,
      });
      if (!flyingSquad) {
        return {
          message: 'Flying squad member not found',
        };
      }
      flyingSquad.out_time = new Date();
      flyingSquad.status = 'completed';
      await flyingSquad.save();
      return {
        message: 'Duty completed successfully',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        throw new HttpException(err.message, 400);
      }
    }
  }

  //#region Remove Flying Squad Member
  async remove(body: DeleteFlyingDto) {
    try {
      const flyingSquad = await this.flyingSquadModel.findById(body.flying_id);
      if (!flyingSquad) {
        throw new HttpException('Flying squad member not found', 404);
      }

      if (flyingSquad.status != 'not started') {
        throw new HttpException(
          'Cannot remove flying squad member once duty has started',
          400,
        );
      }

      await flyingSquad.deleteOne();
      return {
        message: 'Flying squad member removed successfully',
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
