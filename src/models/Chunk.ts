import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: String,
  index: Number,
  embedding: [Number],
});

export default mongoose.model("Chunk", chunkSchema);