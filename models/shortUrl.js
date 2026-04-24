const mongoose = require("mongoose");
const shortId = require("shortid");

const shortUrlSchema = mongoose.Schema(
  {
    fullUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: "Must be a valid URL starting with http:// or https://",
      },
    },
    shortUrl: {
      type: String,
      required: true,
      default: shortId.generate,
      unique: true, // prevents duplicate short URLs
      trim: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
shortUrlSchema.index({ shortUrl: 1 });

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
