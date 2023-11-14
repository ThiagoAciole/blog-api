// app.js
const express = require('express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const Post = require('./models/post');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'API para gerenciar posts de um blog',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos que contêm as rotas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Hello World' });
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/posts', upload.array('images', 10), async (req, res) => {
  const { title, description, author } = req.body;
  const images = req.files.map((file) => file.buffer.toString('base64'));

  try {
    const savedPost = await Post.create({ title, description, images, author });
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/:postId/like', async (req, res) => {
  const postId = req.params.postId;
  const { action } = req.body;

  if (!['like', 'unlike'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      action === 'like' ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ likes: updatedPost.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});