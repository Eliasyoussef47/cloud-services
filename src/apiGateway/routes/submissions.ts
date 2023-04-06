import express from "express";
import multer from "multer";
import SubmissionHandler from "@/apiGateway/handlers/submissions.js";
import { getSubmissionsRoute } from "@/submissionsService/routes/submissions.js";


const getRouter = () => {
	const targetsRouter = express.Router();

	const upload = multer();
	const handler = new SubmissionHandler();

	targetsRouter.route(getSubmissionsRoute(":targetId"))
		.get(handler.index)
		.post(upload.fields([{name: "photo"}]), handler.store);

	return targetsRouter;
};

export default getRouter;
