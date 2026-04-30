import mongoose from "mongoose";

const categoryVideoSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    uploadedByEmail: {
      type: String,
      trim: true,
    },
    uploadedByName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

categoryVideoSchema.index({ category: 1 }, { unique: true });

export default mongoose.model("CategoryVideo", categoryVideoSchema);