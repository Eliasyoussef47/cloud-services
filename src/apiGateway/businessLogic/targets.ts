import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { makeTypedFormData, makeTypedSearchParams } from "@/types/Http.js";
import { StoreBody } from "@/shared/types/targetsService/index.js";

export type ServiceCallArgsAlpha<TQueryParams extends Record<string, unknown> = Record<string, unknown>> = {
	queryParams: TQueryParams;
} & Pick<RequestInit, "headers" | "body">;

export type ServiceCallArgs<TQueryParams extends Record<string, unknown>> = Partial<ServiceCallArgsAlpha<TQueryParams>>;

// export type IndexArgs = Omit<ServiceCallArgs<{locationName?: string}>, "headers" | "body">;
export interface IndexArgs {
	locationName?: string;
}

export type StoreArgs = StoreBody & {
	photo: Blob;
}

export default class Targets {
	/**
	 *
	 * @param args
	 * @throws {Error} When the fetch function fails or if the server responds with >= 500 status code.
	 */
	public static async index(args?: IndexArgs): Promise<Response> {
		const fetchInit: RequestInit = {
			method: "get",
			headers: Targets.getDefaultHeaders()
		};

		const url = new URL(Environment.getInstance().targetServiceUrl);

		if (args && args.locationName) {
			const searchParams = url.searchParams;
			makeTypedSearchParams<IndexArgs>(searchParams, args);
		}

		return await Targets.defaultServiceCall(url, fetchInit);
	}

	public static async store(args: StoreArgs) {
		const myHeaders = Targets.getDefaultHeaders();
		// myHeaders.set("Content-Type", "multipart/form-data");

		const formDataAlpha = makeTypedFormData<StoreArgs>(args);

		const fetchInit: RequestInit = {
			method: "post",
			headers: myHeaders,
			body: formDataAlpha as FormData
		};

		const url = new URL(Environment.getInstance().targetServiceUrl);

		return await Targets.defaultServiceCall(url, fetchInit);
	}

	private static getDefaultHeaders() {
		const myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${AuthServiceBeta.getInstance().gatewayJwt}`);

		return myHeaders
	}

	/**
	 * Used as to perform the HTTP requests.
	 * @param url
	 * @param fetchInit
	 * @private
	 */
	private static async defaultServiceCall(url: URL, fetchInit: RequestInit) {
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
}
