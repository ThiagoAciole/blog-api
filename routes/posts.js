// routes/posts.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Título do post
 *         description:
 *           type: string
 *           description: Descrição do post
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: base64
 *           description: Array de imagens em formato base64
 *         likes:
 *           type: integer
 *           description: Contador de likes
 *         author:
 *           type: string
 *           description: Autor do post
 *         date:
 *           type: string
 *           format: date-time
 *           description: Data de criação do post
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria um novo post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do post
 *               description:
 *                 type: string
 *                 description: Descrição do post
 *               author:
 *                 type: string
 *                 description: Autor do post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array de imagens (arquivos)
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *

 *  @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Increment likes for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to increment likes
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: number
 *       '404':
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
const express = require("express");
const multer = require("multer");
const Post = require("../models/post");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", upload.array("images", 10), async (req, res) => {
  const { title, description, author } = req.body;
  const images = req.files.map((file) => file.buffer.toString("base64"));

  try {
    const savedPost = await Post.create({ title, description, images, author });
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:postId/like", async (req, res) => {
  const postId = req.params.postId;
  const { action } = req.body;

  if (!["like", "unlike"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      action === "like" ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ likes: updatedPost.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;