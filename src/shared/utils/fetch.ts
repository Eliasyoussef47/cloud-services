import createHttpError from "http-errors";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import mime from "mime-types";
import ServicesRegistry from "@/auth/ServicesRegistry.js";
import { CustomError } from "@/shared/types/errors/CustomError.js";

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
	const currentUser = ServicesRegistry.getInstance().user;

	if (!currentUser) {
		throw new CustomError("No current user");
	}

	const myHeaders = new Headers();
	myHeaders.append("Authorization", `Bearer ${AuthServiceBeta.getInstance().getGatewayJwt(currentUser)}`);

	return myHeaders
}

export async function printResponse(response: Response) {
	const clonedResponse = response.clone();
	console.log("Response:");
	console.log("Status: ", clonedResponse.status);
	console.log("Headers: ", clonedResponse.headers);

	const contentType = clonedResponse.headers.get("Content-Type") ?? "";
	const contentTypeMimeType = mime.extension(contentType);

	if (contentTypeMimeType === "json") {
		const body = await clonedResponse.json();
		console.log("Body: ", body);
	} else {
		const body = await clonedResponse.text();
		console.log("Body: ", body);
	}
}

export const setUrlSearchParams = (url: URL, params: URLSearchParams) => {
	return new URL(`${url.origin}${url.pathname}?${params.toString()}`);
}
