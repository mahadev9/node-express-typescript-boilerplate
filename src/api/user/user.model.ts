import { InferSchemaType, Model, Schema, SchemaTypes, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import toJSON from "../../common/utils/toJSON.plugin";
import paginate from "../../common/utils/paginate.plugin";
import { roles } from "../../common/config/roles";
import validator from "validator";

const userSchema = new Schema(
  {
    id: {
      type: SchemaTypes.ObjectId,
      required: true,
      auto: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true, // used by the toJSON plugin
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/) || !value.match(/[!@#$%^&*()_+]/)) {
          throw new Error('password must contain at least 1 letter, 1 number and 1 special character (!@#$%^&*()_+)');
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    picture: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {Types.ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// interface for instance methods
declare interface IUser extends InferSchemaType<typeof userSchema> {
  isPasswordMatch: (password: string) => Promise<boolean>;
}

// interface for static methods
declare interface IUserModel extends Model<IUser> {
  isEmailTaken: (email: string, excludeUserId?: Types.ObjectId) => Promise<boolean>;
  paginate: (filter: any, options: any) => Promise<any>;
}

/**
 * @typedef User
 */
const User = model<IUser, IUserModel>('User', userSchema);

export default User;
