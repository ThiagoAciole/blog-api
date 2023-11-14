const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const Post = require("./models/post");

const app = express();
const PORT = process.env.PORT || 3000;
const swagger = require("./swagger");
app.use("/api-docs", swagger.serveSwaggerUI, swagger.setupSwaggerUI);
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello World" });
});
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Obtém todos os posts
 *     responses:
 *       '200':
 *         description: Lista de posts obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '500':
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno do servidor
 */
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
 */
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/posts", upload.array("images", 10), async (req, res) => {
  const { title, description, author } = req.body;

  try {
    // Comprimir as imagens antes de armazenar no banco de dados
    const compressedImages = await Promise.all(
      req.files.map(async (file) => {
        const compressedBuffer = await sharp(file.buffer)
          .resize({ width: 800 }) // Ajuste o tamanho conforme necessário
          .toBuffer();

        return compressedBuffer.toString("base64");
      })
    );

    const savedPost = await Post.create({
      title,
      description,
      images: compressedImages,
      author,
    });
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Atualiza um post existente
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Novo título do post
 *               description:
 *                 type: string
 *                 description: Nova descrição do post
 *               author:
 *                 type: string
 *                 description: Novo autor do post
 *     responses:
 *       '200':
 *         description: Post atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 *       '500':
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno do servidor
 */
app.put("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;
  const { title, description, author } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, description, author },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Deleta um post
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post a ser deletado
 *     responses:
 *       '204':
 *         description: Post deletado com sucesso
 *       '404':
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 *       '500':
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno do servidor
 */
app.delete("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(204).send(); // Retorna 204 No Content para indicar sucesso sem conteúdo
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Incrementa likes para um post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do post para incrementar os likes
 *     responses:
 *       '200':
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 likes:
 *                   type: number
 *       '404':
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 *       '500':
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro interno do servidor
 */
app.post("/posts/:postId/like", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
