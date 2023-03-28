import express from "express";
import { loginPost } from "@/auth/routes/index.js";

export const nonAuthenticatedRouter = express.Router();

nonAuthenticatedRouter
	.route("/login")
	.post(loginPost);

export const authenticatedRouter = express.Router();
