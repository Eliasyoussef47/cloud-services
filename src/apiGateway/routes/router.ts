import express from "express";
import getTargetRouter from "@/apiGateway/routes/targets.js";
import { authenticationRouter } from "@/apiGateway/routes/authentication.js";

export const nonAuthenticatedRouter = express.Router();

nonAuthenticatedRouter.use(authenticationRouter);

const getAuthenticatedRouter = () => {
	const authenticatedRouter = express.Router();
	// TODO: Circuit breaker.
	authenticatedRouter.use(getTargetRouter());

	return authenticatedRouter;
}

export { getAuthenticatedRouter };
