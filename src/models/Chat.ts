// models/Chat.ts
import mongoose, { Schema, Document as MongooseDocument, Types } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  relatedChunks?: Types.ObjectId[];

  type?: "text" | "document";

  document?: {
    _id: Types.ObjectId;
    originalName: string;
    mimeType: string;
    size: number;
  };
}

export interface IChat extends MongooseDocument {
  userId: Types.ObjectId;
  documentIds: Types.ObjectId[];
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
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
        index: true,
      },
    ],
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
          default: "",
        },
    
        type: {
          type: String,
          enum: ["text", "document"],
          default: "text",
        },
    
        document: {
          _id: Schema.Types.ObjectId,
          originalName: String,
          mimeType: String,
          size: Number,
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