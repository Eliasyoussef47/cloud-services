import "@/shared/utils/fixErrors.js";
import "@/shared/utils/mongooseToJson.js";
import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import express from "express";
import cors from "cors";
import { setupGatewayAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { setupDependencies } from "@/submissionsService/setup.js";
import { uploadedSubmissionsPath } from "@/shared/constants.js";
import { databaseHealth } from "@/submissionsService/middlewares/DatabaseHealth.js";
import { authenticatedRouter } from "@/submissionsService/routes/router.js";

dotenv.config();
Environment.setup();
await setupDependencies();
AuthServiceAlpha.setup();

const port = Number(Environment.getInstance().submissionServiceUrl.port) || 3003;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors());
app.use(express.json());
app.use(databaseHealth);

// TODO: User based authorization.
app.use(uploadedSubmissionsPath, express.static("uploads/submissionsService"));

setupGatewayAuthenticationMiddlewares(app, AuthServiceAlpha.getInstance());

app.use(authenticatedRouter);

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
