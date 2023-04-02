import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

export type ServiceCallArgsAlpha<TQueryParams extends Record<string, unknown> = Record<string, unknown>> = {
	queryParams: TQueryParams;
} & Pick<RequestInit, "headers" | "body">;

export type ServiceCallArgs<TQueryParams extends Record<string, unknown>> = Partial<ServiceCallArgsAlpha<TQueryParams>>;

// export type IndexArgs = Omit<ServiceCallArgs<{locationName?: string}>, "headers" | "body">;
export interface IndexArgs {
	locationName?: string;
}

export default class Targets {
	/**
	 *
	 * @param args
	 * @throws {Error} When the fetch function fails or if the server responds with >= 500 status code.
	 */
	public static async index(args?: IndexArgs): Promise<Response> {
		const myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`);

		const fetchInit = {
			method: "get",
			headers: myHeaders
		};

		const url = new URL(Environment.getInstance().targetServiceUrl);

		if (args && args.locationName) {
			url.searchParams.set("locationName", args.locationName);
		}

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
			throw createHttpError<503>(503, "ServiceUnavailable");
		}

		return fetchResult;
	}
}
