import express from "express";
import { dummyPost } from "@/targetsService/routes/index.js";

export const authenticatedRouter = express.Router();

export const dummyRouter = express.Router();
dummyRouter.route("/")
	.post(dummyPost);

// dummyRouter.stack.forEach(function(r){
// 	if (r.route && r.route.path){
// 		console.log(r.route.path)
// 	}
// })

authenticatedRouter.use(dummyRouter);
