import mongoose, { Schema, Document } from 'mongoose'; //l'ha fatto ChatGPT 

interface User extends Document {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  type?: 'standard' | 'professional' | 'moderator';
  SMM?: string | null;
  verified?: boolean;
  quote_modifier?: number;
}

const userSchema: Schema<User> = new Schema<User>({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    format: 'email'
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    format: 'password'
  },
  type: {
    type: String,
    enum: ['standard', 'professional', 'moderator']
  },
  SMM: {
    type: String,
    format: 'uuid',
    nullable: true
  },
  verified: {
    type: Boolean
  },
  quote_modifier: {
    type: Number
  }
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
