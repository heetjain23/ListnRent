import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// At least one identifier must exist
// userSchema.pre("save", function (next) {
//   if (!this.phone && !this.email && !this.googleId) {
//     return next(new Error("User must have phone, email, or googleId"));
//   }
//   next();
// });

userSchema.pre("save", function () {
  if (!this.phone && !this.email && !this.googleId) {
    throw new Error("User must have phone, email, or googleId");
  }
});

export default mongoose.model("User", userSchema);