// models/follow.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface Follow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
}

const followSchema = new Schema<Follow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// One follow relationship only once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const FollowModel =
  mongoose.models.Follow || mongoose.model<Follow>("Follow", followSchema);

export default FollowModel;
