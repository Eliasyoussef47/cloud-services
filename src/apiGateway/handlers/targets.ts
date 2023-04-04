import { RequestHandler } from "express-serve-static-core";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import Targets, { IndexArgs, StoreArgs } from "@/apiGateway/businessLogic/targets.js";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";
import { toZod } from "tozod";
import { z } from "zod";
import { storeBodySchema, storeFilesSchema } from "@/shared/validation/targets.js";
import { User } from "@/auth/models/User.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const indexCircuitBreaker = new CircuitBreaker(Targets.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

const storeCircuitBreaker = new CircuitBreaker(Targets.store, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(storeCircuitBreaker);

const indexParamsSchema: toZod<IndexArgs> = z.object({
	locationName: z.string().optional()
});

// TODO: Validation.
export default class TargetHandler {
	// TODO: Validation.
	public static index: RequestHandler<IndexArgs> = async (req, res, next) => {
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

	public static store: RequestHandler = async (req, res, next) => {
		// TODO: Better validation is possible.
		const reqBody = storeBodySchema.parse(req.body);
		const uploadedFiles = storeFilesSchema.parse(req.files);
		const uploadedFile = uploadedFiles.photo[0];
		const photoBlob = new Blob([uploadedFile.buffer], { type: uploadedFile.mimetype });
		const user = req.user as User;

		const args: StoreArgs = {
			userId: user.customId,
			locationName: reqBody.locationName,
			photo: photoBlob
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
	};

	public static show: RequestHandler = async (req, res) => {

	};

	public static update: RequestHandler = async (req, res) => {

	};

	public static destroy: RequestHandler = async (req, res) => {

	};
}


