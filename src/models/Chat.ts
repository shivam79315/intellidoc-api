// models/Chat.ts
import mongoose, { Schema, Document as MongooseDocument, Types } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  relatedChunks?: Types.ObjectId[];
}

export interface IChat extends MongooseDocument {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        relatedChunks: [
          {
            type: Schema.Types.ObjectId,
            ref: "Chunk",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChat>("Chat", chatSchema);