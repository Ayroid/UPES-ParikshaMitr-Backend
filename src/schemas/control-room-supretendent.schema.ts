import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LoginControlRoomSupretendentDocument =
  HydratedDocument<LoginControlRoomSupretendent>;

@Schema()
export class LoginControlRoomSupretendent {
  @Prop()
  name: string;

  @Prop({ unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop({
    type: String,
    enum: ['admin', 'proctor'],
    default: 'proctor',
  })
  role: string;
}

export const LoginControlRoomSupretendentSchema = SchemaFactory.createForClass(
  LoginControlRoomSupretendent,
);
