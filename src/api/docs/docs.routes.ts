import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import config from "../../common/config/config";

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
    },
    servers: [
      {
        url: `http://${config.url}`,
      },
    ],
  },
  apis: ["src/api/*/*.routes.ts", "src/api/docs/swagger.yml"],
};

const specs = swaggerJSDoc(options);

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(specs, { explorer: true }));

export default router;
