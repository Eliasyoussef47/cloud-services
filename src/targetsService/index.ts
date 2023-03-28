import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import multer from "multer";
import { AuthService } from "@/auth/AuthService.js";
import express from "express";
import cors from "cors";
import { setupGatewayAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";

dotenv.config();
Environment.setup();
const upload = multer({ dest: 'uploads/' });
AuthService.setup();

const port = Number(Environment.getInstance().apiGatewayUrl.port) || 3001;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors())
app.use(express.json());
app.use(upload.fields([]));

setupGatewayAuthenticationMiddlewares(app, AuthService.getInstance());

// TODO: Add routes.

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
