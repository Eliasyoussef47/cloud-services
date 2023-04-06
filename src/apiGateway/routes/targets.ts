import express from "express";
import TargetHandler from "@/apiGateway/handlers/targets.js";
import multer from "multer";

const getRouter = () => {
	const route = "/targets";
	const targetsRouter = express.Router();

	const upload = multer();

	targetsRouter.route(route)
		.get(TargetHandler.index)
		.post(upload.fields([{name: "photo"}]), TargetHandler.store);

	return targetsRouter;
};

export default getRouter;
