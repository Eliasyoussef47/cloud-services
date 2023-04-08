import "@/shared/utils/fixErrors.js";
import "@/shared/utils/mongooseToJson.js";
import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import express from "express";
import cors from "cors";
import { setupGatewayAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { authenticatedRouter } from "@/targetsService/routes/router.js";
import { uploadedTargetsPath } from "@/shared/constants.js";
import { setupDependencies } from "@/targetsService/setup.js";
import promBundle from "express-prom-bundle";
import { authorizationSetup } from "@/shared/authorization/AuthorizationHandler.js";
import { isAdmin } from "@/shared/authorization/index.js";

dotenv.config();
Environment.setup();
await setupDependencies();
AuthServiceAlpha.setup();

const port = Number(Environment.getInstance().targetServiceUrl.port) || 3001;

const metricsMiddleware = promBundle({
	includePath: true,
	includeStatusCode: true,
	promClient: {
		collectDefaultMetrics: {}
	}
});

const app = express();

app.use(metricsMiddleware);

app.set("env", process.env.NODE_ENV);

app.use(cors())
app.use(express.json());

// TODO: User based authorization.
app.use(uploadedTargetsPath, express.static("uploads/targetsService"));

setupGatewayAuthenticationMiddlewares(app, AuthServiceAlpha.getInstance());

app.use(authorizationSetup);
app.use(isAdmin);

app.use(authenticatedRouter);

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port);
});
