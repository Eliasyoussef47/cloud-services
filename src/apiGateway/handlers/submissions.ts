import { RequestHandler } from "express-serve-static-core";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";
import Submissions, { IndexArgs, StoreArgs } from "@/apiGateway/businessLogic/submissions.js";
import { toZod } from "tozod";
import { z } from "zod";
import { storeFilesSchema } from "@/shared/validation/targets.js";
import { User } from "@/auth/models/User.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const submissionsService = new Submissions();

const indexCircuitBreaker = new CircuitBreaker(submissionsService.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

const storeCircuitBreaker = new CircuitBreaker(submissionsService.store, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(storeCircuitBreaker);

const showCircuitBreaker = new CircuitBreaker(submissionsService.show, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(storeCircuitBreaker);

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

	public store: RequestHandler = async (req, res, next) => {
		const parsedParams = indexParamsSchema.parse(req.params);
		const uploadedFiles = storeFilesSchema.parse(req.files);
		const uploadedFile = uploadedFiles.photo[0];
		const photoBlob = new Blob([uploadedFile.buffer], { type: uploadedFile.mimetype });
		const user = req.user as User;

		const args: StoreArgs = {
			userId: user.customId,
			photo: photoBlob,
			targetId: parsedParams.targetId
		};

		let fireResult: Response;
		try {
			fireResult = await storeCircuitBreaker.fire(args);
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
	}

	public show: RequestHandler = async (req, res, next) => {
		// TODO: Validate route params.

		let fireResult: Response;
		try {
			fireResult = await showCircuitBreaker.fire({ id: req.params.id });
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
	}
}
