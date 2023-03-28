import * as dotenv from "dotenv";
import express from "express";
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
// app.use(express.urlencoded({ extended: true }));

app.post("/login", (req, res, next) => {
	const loginForm: LoginForm = loginFormSchema.parse(req.body);

	const loginJwt = AuthService.getInstance().login(loginForm);

	if (!loginJwt) {
		throw createHttpError(401);
	}

	const responseBody = {
		status: "success",
		data: {
			token: loginJwt,
		},
	};

	res.json(responseBody);
});

const JwtStrategy = passportJwt.Strategy;

const authenticateUserStrategy = new JwtStrategy(AuthService.getInstance().jwtOptions, (payload, done) => {
	AuthService.getInstance().getMatchingUser(payload)
		.then((value) => {
			return done(null, value);
		})
		.catch((e) => {
			done(createHttpError(401, e), false);
		});
});

passport.use(authenticateUserStrategy);

app.use(passport.initialize());
// TODO: Roles and such.
// app.use(roles.middleware());
app.use(passport.authenticate("jwt", {session: false}));

app.get("/protected",
	(req, res, next) => {
		const responseBody = {
			status: "success",
			data: {
				message: "welkom"
			}
		};

		res.json(responseBody);
	});

app.use(convertToHttpError);
app.use(httpErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
	console.log('Server is up on port ' + port)
});
