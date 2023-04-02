import express from "express";
import TargetHandler from "@/apiGateway/handlers/targets.js";
import multer from "multer";

const getRouter = () => {
	const route = "/targets";
	const targetsRouter = express.Router();

	const upload = multer();

	targetsRouter.route(route)
		.get(TargetHandler.index)
		.post(upload.single("photo"), TargetHandler.store);

	return targetsRouter;

	// const proxyOptions: ProxyOptions = {
	// 	target: Environment.getInstance().targetServiceUrl,
	// 	changeOrigin: true,
	// 	headers: {
	// 		"Authorization": `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`
	// 	},
	// 	/**
	// 	 * Fix bodyParser
	// 	 **/
	// 	on: {},
	// 	// selfHandleResponse: true,
	// 	ejectPlugins: true,
	// 	plugins: [debugProxyErrorsPlugin, loggerPlugin, proxyEventsPlugin],
	// };

	// const targetsProxy = createProxyMiddleware(proxyOptions);

	// const circuitBreakerOptions: CircuitBreakerOptions = {
	// 	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	// 	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	// 	resetTimeout: 3000 // After 3 seconds, try again.
	// };

	// const callServiceBreaker1: CircuitBreakerRequestHandler = new CircuitBreaker(asyncRequestHandlerWrapper(targetsProxy.middleware), circuitBreakerOptions);
	// callServiceBreaker1.fallback(() => {
	// 	throw new CustomError("Sorry, out of service right now");
	// });
	// callServiceBreaker1.on("fallback", (result) => {
	// 	console.log("callServiceBreaker1: fallback: ", result);
	// });
	// callServiceBreaker1.on("success", () => console.log("callServiceBreaker1: success"));
	// callServiceBreaker1.on("failure", () => console.log("callServiceBreaker1: failed"));
	// callServiceBreaker1.on("timeout", () => console.log("callServiceBreaker1: timed out"));
	// callServiceBreaker1.on("reject", () => console.log("callServiceBreaker1: rejected"));
	// callServiceBreaker1.on("open", () => console.log("callServiceBreaker1: opened"));
	// callServiceBreaker1.on("halfOpen", () => console.log("callServiceBreaker1: halfOpened"));
	// callServiceBreaker1.on("close", () => console.log("callServiceBreaker1: closed"));
}

export default getRouter;
