import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { format } from 'date-fns';
import mongoose, { HydratedDocument, Mongoose } from 'mongoose';

export type CopyBundleDocument = HydratedDocument<CopyBundle>;

@Schema({
  timestamps: true,
})
export class CopyBundle {
  @Prop({ required: true })
  date_of_exam: string;

  @Prop({ required: true })
  evaluation_mode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' })
  evaluator: string;

  @Prop({ required: true })
  subject_code: string;

  @Prop({ required: true })
  subject_name: string;

  @Prop({ required: true })
  subject_school: string;

  @Prop({ required: true })
  room_no: number;

  @Prop({
    type: [
      {
        batch: { type: String, required: true },
        no_of_students: { type: Number, required: true },
        program: { type: String, required: true },
        status: {
          type: String,
          enum: ['AVAILABLE', 'ALLOTTED', 'INPROGRESS', 'SUBMITTED'],
          default: 'AVAILABLE',
        },
        available_date: {
          type: Date,
          default: () => new Date(),
        },
        allotted_date: {
          type: Date,
          default: null,
        },
        start_date: { type: Date, default: null },
        submit_date: { type: Date, default: null },
        distibuter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ExamController',
        },
      },
    ],
  })
  copies: [
    {
      batch: string;
      no_of_students: number;
      program: string;
      status?: string;
      allotted_date?: Date;
      available_date?: Date;
      start_date?: Date;
      submit_date?: Date;
      distibuter?: string;
    },
  ];
}

export const CopyBundleSchema = SchemaFactory.createForClass(CopyBundle);
