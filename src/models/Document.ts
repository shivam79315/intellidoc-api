import mongoose, { Schema, Document as MongooseDocument, Types } from "mongoose";

export interface IDocument extends MongooseDocument {
  userId: Types.ObjectId;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  status: "pending" | "processing" | "ready" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);

export default DocumentModel;