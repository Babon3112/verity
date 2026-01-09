import mongoose, { Schema, Document, Types } from "mongoose";

export interface Like extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likeSchema = new Schema<Like>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes
likeSchema.index({ user: 1, post: 1 }, { unique: true });

const LikeModel =
  mongoose.models.Like || mongoose.model<Like>("Like", likeSchema);

export default LikeModel;
