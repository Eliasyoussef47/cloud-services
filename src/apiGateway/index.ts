import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import { Environment } from "@/shared/operation/Environment.js";
import multer from "multer";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { setupUserAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { authenticatedRouter, nonAuthenticatedRouter } from "@/apiGateway/routes/router.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import AuthDatabase from "@/auth/persistence/mongoose/Database.js";

dotenv.config();
Environment.setup();
await AuthDatabase.setup();
AuthServiceAlpha.setup();
AuthServiceBeta.setup();

const port = Number(Environment.getInstance().apiGatewayUrl.port) || 3000;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors());
app.use(express.json());
// TODO: Use multer correctly.
// const upload = multer({ dest: 'uploads/' });
// app.use(upload.fields([]));

app.use(nonAuthenticatedRouter);

setupUserAuthenticationMiddlewares(app, AuthServiceBeta.getInstance());
// TODO: Roles and such.
// app.use(roles.middleware());

app.use(authenticatedRouter);

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
