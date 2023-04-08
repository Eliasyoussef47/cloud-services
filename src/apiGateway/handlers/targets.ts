import { RequestHandler, RouteParameters } from "express-serve-static-core";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import Targets, { IndexArgs, StoreArgs } from "@/apiGateway/businessLogic/targets.js";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";
import { toZod } from "tozod";
import { z } from "zod";
import { storeBodySchema, storeFilesSchema } from "@/shared/validation/targets.js";
import { User } from "@/auth/models/User.js";
import { indexCaller as submissionsIndexCaller } from "@/apiGateway/handlers/submissions.js"
import { IndexResponseBody } from "@/submissionsService/handlers/submissions.js";
import { ShowQueries as TargetShowQueries, ShowResponseBody as TargetsShowResponseBody, TargetResource } from "@/targetsService/handlers/targets.js";
import { Submission } from "@/submissionsService/models/Submission.js";
import { ResponseBody } from "@/shared/types/Response.js";
import { isTrue, noError } from "@/shared/utils/general.js";
import { ServiceCallResult } from "@/apiGateway/types.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const indexCircuitBreaker = new CircuitBreaker(Targets.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

const storeCircuitBreaker = new CircuitBreaker(Targets.store, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(storeCircuitBreaker);

const showCircuitBreaker = new CircuitBreaker(Targets.show, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(showCircuitBreaker);

const deleteCircuitBreaker = new CircuitBreaker(Targets.destroy, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(deleteCircuitBreaker);

const indexQuerySchema: toZod<IndexArgs> = z.object({
	locationName: z.string().optional()
});

export type Target_Submissions = TargetResource & {
	submissions?: Submission[];
}

export type ShowResponseBody = ResponseBody<{ target: Target_Submissions }>;

export type ShowQueries = TargetShowQueries & {
	submissions?: string;
}

/**
 *
 * @param targetId
 * @param urlSearchParams
 * @throws Whatever indexCircuitBreaker or Request.json throw.
 */
async function showCaller(targetId: string, urlSearchParams: URLSearchParams): Promise<ServiceCallResult<TargetsShowResponseBody>> {
	let fireResult: Response;
	try {
		fireResult = await showCircuitBreaker.fire({ id: targetId }, urlSearchParams);
	} catch (e) {
		console.log("Service breaker rejected: ", e);
		throw e;
	}

	let targetsResponseJson: TargetsShowResponseBody;
	try {
		targetsResponseJson = await fireResult.json();
	} catch (e) {
		console.log("Response from service wasn't json: ", e);
		throw e;
	}

	return {
		statusCode: fireResult.status,
		body: targetsResponseJson
	};
}

export default class TargetHandler {
	// TODO: Validation.
	public static index: RequestHandler<IndexArgs> = async (req, res, next) => {
		const parsedQueries = indexQuerySchema.parse(req.query);

		let fireResult: Response;
		try {
			fireResult = await indexCircuitBreaker.fire(parsedQueries);
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

	public static show: RequestHandler<RouteParameters<"/targets/:id">, {}, {}, ShowQueries> = async (req, res, next) => {
		// TODO: Validate route params.
		const targetId: string = req.params.id;

		let targetResponse: ServiceCallResult<TargetsShowResponseBody>;
		try {
			targetResponse = await showCaller(targetId, new URLSearchParams(req.query));
			if (targetResponse.statusCode >= 400) {
				res.status(targetResponse.statusCode).json(targetResponse.body);
				return;
			}
		} catch (e) {
			next(e);
			return;
		}

		const targetFromService = targetResponse.body.data.target;
		let submissionsFromService: Submission[] | undefined = undefined;

		if (isTrue(req.query.submissions)) {
			let submissionsResponse: ServiceCallResult<IndexResponseBody>;
			try {
				submissionsResponse = await submissionsIndexCaller({ targetId: targetId });
				if (noError(submissionsResponse.statusCode)) {
					submissionsFromService = submissionsResponse.body.data.submissions;
				}
			} catch (e) {
				console.log("Error while calling submissions service: ", e);
			}
		}

		const targetWithSubmissions: Target_Submissions = {
			...targetFromService
		};

		// Aggregate the response.
		if (submissionsFromService) {
			targetWithSubmissions.submissions = submissionsFromService
		}

		const response = {
			status: "success",
			data: {
				target: targetWithSubmissions
			}
		} satisfies ShowResponseBody

		res.status(targetResponse.statusCode).json(response);
	};

	public static update: RequestHandler = async (req, res) => {

	};

	public static destroy: RequestHandler = async (req, res, next) => {
		let fireResult: Response;
		try {
			fireResult = await deleteCircuitBreaker.fire({ id: req.params.id });
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


