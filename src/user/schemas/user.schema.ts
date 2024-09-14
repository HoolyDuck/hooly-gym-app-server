import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  credentials: {
    email: string;
    password: string;
  };

  @Prop({ type: { provider: String, id: String } })
  oauthAccounts: {
    provider: string;
    id: string;
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

// hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.credentials.password) {
    this.credentials.password = await bcrypt.hash(
      this.credentials.password,
      10,
    );
  }
});

export { UserSchema };
