const mongoose = require("../db");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  images: {
    type: [String],
  },
  likes: {
    type: Number,
    default: 0,
  },
  author: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
