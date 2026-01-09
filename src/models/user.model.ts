import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;

  avatar?: string;
  bio?: string;

  dateOfBirth: Date;
  gender: "male" | "female" | "other";

  isVerified: boolean;
  isBlocked: boolean;

  followersCount: number;
  followingCount: number;
  postsCount: number;

  verifyCode?: string;
  verifyCodeExpiry?: Date;

  resetPasswordCode?: string;
  resetPasswordExpiry?: Date;
}

const userSchema = new Schema<User>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9._]+$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    avatar: {
      type: String,
      default: "https://res.cloudinary.com/arnabcloudinary/image/upload/v1713427478/EazyBuy/Avatar/no-avatar.png",
    },

    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date) => value < new Date(),
        message: "Date of birth must be in the past",
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    verifyCode: {
      type: String,
    },

    verifyCodeExpiry: {
      type: Date,
    },

    resetPasswordCode: {
      type: String,
    },

    resetPasswordExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserModel =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

export default UserModel;
