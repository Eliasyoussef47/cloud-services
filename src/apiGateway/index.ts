import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { AuthService } from "@/auth/AuthService.js";
import { Environment } from "@/shared/operation/Environment.js";
import multer from "multer";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { setupUserAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { authenticatedRouter, nonAuthenticatedRouter } from "@/apiGateway/routes/router.js";

dotenv.config();
Environment.setup();
const upload = multer({ dest: 'uploads/' });
AuthService.setup();

const port = Number(Environment.getInstance().apiGatewayUrl.port) || 3000;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors())
app.use(express.json());
app.use(upload.fields([]));

app.use(nonAuthenticatedRouter);

setupUserAuthenticationMiddlewares(app, AuthService.getInstance());
// TODO: Roles and such.
// app.use(roles.middleware());

app.use(authenticatedRouter);

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
