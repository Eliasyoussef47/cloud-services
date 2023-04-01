import express from "express";
import { createProxyMiddleware, fixRequestBody, Options } from 'http-proxy-middleware';
import multer from "multer";
import { Environment } from "@/shared/operation/Environment.js";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

const getRouter = () => {
	const route = "/targets";
	const targetsRouter = express.Router();
// const upload = multer({ dest: 'uploads/apiGateway/' });

	const proxyOptions: Options = {
		target: Environment.getInstance().targetServiceUrl,
		changeOrigin: true,
		headers: {
			"Authorization": `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`
		},
		/**
		 * Fix bodyParser
		 **/
		onProxyReq: fixRequestBody
	};

	const targetsProxy = createProxyMiddleware(route, proxyOptions);
	targetsRouter.use(route, targetsProxy);

	return targetsRouter;
}

export default getRouter;
