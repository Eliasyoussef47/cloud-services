import { RequestHandler } from "express-serve-static-core";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";
import Submissions, { IndexArgs } from "@/apiGateway/businessLogic/submissions.js";
import { toZod } from "tozod";
import { z } from "zod";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const submissionsService = new Submissions();

const indexCircuitBreaker = new CircuitBreaker(submissionsService.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

const indexParamsSchema: toZod<IndexArgs> = z.object({
	targetId: z.string()
});

export default class SubmissionHandler {
	public index: RequestHandler<IndexArgs> = async (req, res, next) => {
		const parsedParams = indexParamsSchema.parse(req.params);

		let fireResult: Response;
		try {
			fireResult = await indexCircuitBreaker.fire(parsedParams);
		} catch (e) {
			console.log("Service breaker rejected: ", e);
			next(e);
			return;
		}

		try {
			const responseJson = await fireResult.json();

			res.status(fireResult.status).json(responseJson);
		} catch (e) {
			console.log("Response from service wasn't json: ", e);
			next(e);
			return;
		}
	};
}
