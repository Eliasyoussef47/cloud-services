import express from "express";
import AuthenticationHandler from "@/auth/handlers/authentication.js";

export const authenticationRouter = express.Router();
authenticationRouter.route("/register")
	.post(AuthenticationHandler.register);
authenticationRouter.route("/login")
	.post(AuthenticationHandler.loginPost);
