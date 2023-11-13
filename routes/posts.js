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

// Rota para obter todos os posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para criar um novo post com upload de imagens
router.post("/", upload.array("images", 10), async (req, res) => {
  const { title, description, author } = req.body;

  // Obtém as imagens do buffer e converte para base64
  const images = req.files.map((file) => file.buffer.toString("base64"));

  const newPost = new Post({ title, description, images, author });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:postId/like", async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Verifica se a solicitação é para curtir ou descurtir
    if (req.body.action === "like") {
      post.likes += 1;
    } else if (req.body.action === "unlike" && post.likes > 0) {
      post.likes -= 1;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
