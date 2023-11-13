// app.js
const express = require('express');
const postsRouter = require('./routes/posts');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
app.use('/posts', postsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
