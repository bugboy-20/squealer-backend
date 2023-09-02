import mongoose, { Schema, Document } from 'mongoose'; //l'ha fatto ChatGPT 

interface User extends Document {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  type: 'standard' | 'professional' | 'moderator';
  SMM: string | null;
  verified: boolean;
  quote_modifier: number;
  quote: {
    day: number;
    week: number;
    month: number;
  }
  refreshToken?: string;
}

const userSchema: Schema<User> = new Schema<User>({
  username: {
    type: String,
    unique: true,
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
    required: true,
    enum: ['standard', 'professional', 'moderator']
  },
  SMM: {
    type: String,
    default: null,
    nullable: true
  },
  verified: {
    required: true,
    type: Boolean
  },
  quote_modifier: {
    required: true,
    type: Number
  },
  quote: {
    day: {
      type: Number
    },
    week: {
      type: Number
    },
    month: {
      type: Number
    }
  },
  refreshToken: String

});

const UserModel = mongoose.model<User>('User', userSchema);

export {User,UserModel}
