import createHttpError from "http-errors";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

/**
 * Used as to perform the HTTP requests to the microservices.
 * @param url
 * @param fetchInit
 * @private
 */
export async function defaultServiceCall(url: URL, fetchInit: RequestInit) {
	let fetchResult;

	try {
		fetchResult = await fetch(url, fetchInit);
	} catch (e) {
		if (e instanceof Object) {
			console.log("Error during request to microservice: ", e.toString());
		} else {
			console.log("Error during request to microservice: ", e);
		}
		throw createHttpError<503>(503, "ServiceUnavailable");
	}

	if (fetchResult.status >= 500) {
		console.log("Error (json) from service:");
		const errorBody = await fetchResult.json();
		console.log(errorBody);
		throw createHttpError<503>(503, "ServiceUnavailable");
	}

	return fetchResult;
}

export function getServicesAuthHeaders() {
	const myHeaders = new Headers();
	myHeaders.append("Authorization", `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`);

	return myHeaders
}
