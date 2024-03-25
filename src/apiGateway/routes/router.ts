import express from "express";
import getTargetRouter from "@/apiGateway/routes/targets.js";
import { authenticationRouter } from "@/apiGateway/routes/authentication.js";
import getSubmissionsRouter from "@/apiGateway/routes/submissions.js";

export const nonAuthenticatedRouter = express.Router();

nonAuthenticatedRouter.use(authenticationRouter);

const getAuthenticatedRouter = () => {
	const authenticatedRouter = express.Router();
	authenticatedRouter.use(getSubmissionsRouter());
	authenticatedRouter.use(getTargetRouter());

	return authenticatedRouter;
};

export { getAuthenticatedRouter };
