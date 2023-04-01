import "@/shared/utils/fixErrors.js";
import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import express from "express";
import cors from "cors";
import { setupGatewayAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { authenticatedRouter } from "@/targetsService/routes/router.js";

dotenv.config();
Environment.setup();
AuthServiceAlpha.setup();

const port = Number(Environment.getInstance().targetServiceUrl.port) || 3001;

const app = express();

app.set("env", process.env.NODE_ENV);

app.use(cors())
app.use(express.json());

setupGatewayAuthenticationMiddlewares(app, AuthServiceAlpha.getInstance());

// TODO: Add routes.
app.use(authenticatedRouter);

// authenticatedRouter.stack.forEach(function(r){
// 	if (r.route && r.route.path){
// 		console.log(r.route.path)
// 	}
// })

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
