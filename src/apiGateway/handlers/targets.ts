import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { RequestHandler } from "express-serve-static-core";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import CircuitBreaker, { Options as CircuitBreakerOptions } from "opossum";
import Targets from "@/apiGateway/businessLogic/targets.js";
import { attachStandardCircuitBreakerCallbacks } from "@/shared/utils/CircuitBreaker.js";

const circuitBreakerOptions: CircuitBreakerOptions = {
	timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
	errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
	resetTimeout: 3000 // After 3 seconds, try again.
};

const indexCircuitBreaker = new CircuitBreaker(Targets.index, circuitBreakerOptions);
attachStandardCircuitBreakerCallbacks(indexCircuitBreaker);

export default class TargetHandler {
	public static index: RequestHandler = async (req, res, next) => {
		// TODO: Get location name.
		let fireResult: Response;
		try {
			fireResult = await indexCircuitBreaker.fire();

			const responseJson = await fireResult.json();

			res.status(fireResult.status).json(responseJson);
		} catch (e) {
			console.log("Service breaker rejected: ", e);
			next(e);
		}
	};

	public static store: RequestHandler = async (req, res) => {
		const myHeaders = new Headers();
		// if (req.headers["content-type"]) {
		// 	myHeaders.append("Content-Type", req.headers["content-type"]);
		// }
		myHeaders.append("Authorization", `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`);

		// TODO: Validation.
		const formData = new FormData();
		formData.set("locationName", req.body["locationName"]);
		formData.set("photo", new Blob([req.file!.buffer]));

		const fetchInit = {
			method: "post",
			headers: myHeaders,
			body: formData
		};

		let fetchResult;

		try {
			fetchResult = await fetch(Environment.getInstance().targetServiceUrl, fetchInit);
		} catch (e) {
			if (e instanceof Object) {
				console.log(`Error during request to microservice: `, e.toString());
			} else {
				console.log(`Error during request to microservice: `, e);
			}
			throw createHttpError(500, "Error during request to microservice");
		}

		if (fetchResult.status >= 400) {
			throw createHttpError(fetchResult.status, fetchResult.statusText);
		}

		res.status(fetchResult.status).json(await fetchResult.json());
	};

	public static show: RequestHandler = async (req, res) => {

	};

	public static update: RequestHandler = async (req, res) => {

	};

	public static destroy: RequestHandler = async (req, res) => {

	};
}


