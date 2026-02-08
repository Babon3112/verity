// models/post.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface Post extends Document {
  author: Types.ObjectId;

  content: string;

  media?: {
    url: string;
    publicId: string;
    type: "image" | "video";
  }[];

  visibility: "public" | "followers" | "private";

  likesCount: number;
  commentsCount: number;

  hideLikesCount: boolean;
  disableComments: boolean;
}

const postSchema = new Schema<Post>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: true,
    },

    media: {
      type: [
        {
          url: String,
          publicId: String,
          type: {
            type: String,
            enum: ["image", "video"],
          },
        },
      ],
      validate: {
        validator: function (value: any[]) {
          return value.length <= 4;
        },
        message: "Maximum 4 media files allowed",
      },
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    hideLikesCount: {
      type: Boolean,
      default: false,
    },

    disableComments: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const PostModel =
  mongoose.models.Post || mongoose.model<Post>("Post", postSchema);

export default PostModel;
