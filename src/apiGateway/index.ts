import * as dotenv from "dotenv";
import express, { Express } from "express";
import { ErrorRequestHandler, Request } from "express-serve-static-core";
import ConnectRoles from "connect-roles";
import passportJwt from "passport-jwt";
import passport from "passport";
import cors from "cors";
import createHttpError from "http-errors";
import { AuthService, LoginForm } from "@/auth/AuthService.js";
import { Environment } from "@/shared/operation/Environment.js";
import { convertToHttpError, errorHandler, httpErrorHandler } from "@/shared/ErrorHandlers.js";
import { loginFormSchema } from "@/auth/validation/LoginForm.js";
import multer from "multer";
import { attachErrorHandlers } from "@/shared/operation/errorHandling.js";
import { loginPost } from "@/auth/routes/index.js";
import { setupAuthenticationMiddlewares } from "@/auth/middlewares/authentication.js";
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

setupAuthenticationMiddlewares(app, AuthService.getInstance());
// TODO: Roles and such.
// app.use(roles.middleware());

authenticatedRouter.get("/protected",
	(req, res, next) => {
		const responseBody = {
			status: "success",
			data: {
				message: "welkom"
			}
		};

		res.json(responseBody);
	});

app.use(authenticatedRouter);

attachErrorHandlers(app);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
