const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API for Posts",
      version: "1.0.0",
      description: "A simple API for managing posts.",
    },
    servers: [
      {
        url: "https://blog-api-phi-five.vercel.app",
        description: "Prod server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./app.js"], // Substitua pelo caminho real do seu arquivo de aplicativo
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  serveSwaggerUI: swaggerUi.serve,
  setupSwaggerUI: swaggerUi.setup(swaggerSpec),
  swaggerSpec: swaggerSpec,
};
