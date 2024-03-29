import mongoose, { Schema, Document } from 'mongoose'; //l'ha fatto ChatGPT 

interface User extends Document {
  username: string;
  propic: string;
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
  blocked: boolean;
  subscriptions: string[];
  refreshToken: string[];
}

const userSchema: Schema<User> = new Schema<User>({
  username: {
    type: String,
    unique: true,
    required: true
  },
  propic: {
    type: String,
    format: 'url',
    default: function () {
      // Use the username to generate the default URL
      return `https://api.dicebear.com/7.x/lorelei/png?seed=${this.username}`;
    }
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
  blocked: {
    required: true,
    default: false,
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
  refreshToken: {
    type: [String],
    default: []
  },
  subscriptions: {
    type: [String],
    default: []
  }
});

const UserModel = mongoose.model<User>('User', userSchema);

export {User,UserModel}
