import "@/shared/utils/fixErrors.js";
import "@/shared/utils/mongooseToJson.js";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import { Environment } from "@/shared/operation/Environment.js";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { setupUserAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { getAuthenticatedRouter, nonAuthenticatedRouter } from "@/apiGateway/routes/router.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { setupDependencies } from "@/apiGateway/setup.js";
import { removeUser } from "@/auth/middlewares/removeUser.js";

// TODO: Database health check.
// TODO: Message broker health check.
dotenv.config();
Environment.setup();
await setupDependencies();
AuthServiceAlpha.setup();
AuthServiceBeta.setup();

const port = Number(Environment.getInstance().apiGatewayUrl.port) || 3000;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors());
app.use(express.json());
app.use(removeUser);

app.use(nonAuthenticatedRouter);

setupUserAuthenticationMiddlewares(app, AuthServiceBeta.getInstance());

app.use(getAuthenticatedRouter());

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
