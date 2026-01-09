import mongoose, { Schema, Document, Types } from "mongoose";

export interface Comment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;

  content: string;

  parentComment?: Types.ObjectId; // for replies
  isDeleted: boolean;
}

const commentSchema = new Schema<Comment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

const CommentModel =
  mongoose.models.Comment || mongoose.model<Comment>(
    "Comment",
    commentSchema
  );

export default CommentModel;
