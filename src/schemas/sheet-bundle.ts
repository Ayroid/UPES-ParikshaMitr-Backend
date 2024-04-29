import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { format } from 'date-fns';
import mongoose, { HydratedDocument } from 'mongoose';

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
          type: String,
          default: null,
        },
        start_date: { type: String, default: null },
        submit_date: { type: String, default: null },
      },
    ],
  })
  copies: [
    {
      batch: string;
      no_of_students: number;
      program: string;
      status?: string;
      allotted_date?: string;
      available_date?: string;
      start_date?: string;
      submit_date?: string;
    },
  ];
}

export const CopyBundleSchema = SchemaFactory.createForClass(CopyBundle);
