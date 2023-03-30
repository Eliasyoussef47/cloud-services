import express from "express";
import AuthenticationHandler from "@/auth/handlers/authentication.js";

export const authenticationRouter = express.Router();
authenticationRouter.route("/login")
	.post(AuthenticationHandler.loginPost);
