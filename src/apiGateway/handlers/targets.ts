import { RequestHandler } from "express-serve-static-core";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import Targets, { StoreArgs } from "@/apiGateway/businessLogic/targets.js";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 10000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const indexCircuitBreaker = new CircuitBreaker(Targets.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

const storeCircuitBreaker = new CircuitBreaker(Targets.store, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(storeCircuitBreaker);

// TODO: Validation.
export default class TargetHandler {
	// TODO: Validation.
	public static index: RequestHandler = async (req, res, next) => {
		// TODO: Get location name.
		let fireResult: Response;
		try {
			fireResult = await indexCircuitBreaker.fire();
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

	// TODO: Validation.
	public static store: RequestHandler = async (req, res, next) => {
		console.log("gateway.targets.store.file", req.file);
		const args: StoreArgs = {
			// locationName: req.body["locationName"] as string,
			// photo: new Blob([req.file!.buffer])
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


