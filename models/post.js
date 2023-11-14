const mongoose = require("../db");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  timestamps: true
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;