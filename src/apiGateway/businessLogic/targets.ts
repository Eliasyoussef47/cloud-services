import { Environment } from "@/shared/operation/Environment.js";
import { makeTypedFormData, makeTypedSearchParams } from "@/types/Http.js";
import { StoreBody } from "@/shared/types/targetsService/index.js";
import { Target } from "@/targetsService/models/Target.js";
import { defaultServiceCall, getServicesAuthHeaders } from "@/shared/utils/fetch.js";

// export type ServiceCallArgsAlpha<TQueryParams extends Record<string, unknown> = Record<string, unknown>> = {
// 	queryParams: TQueryParams;
// } & Pick<RequestInit, "headers" | "body">;

// export type ServiceCallArgs<TQueryParams extends Record<string, unknown>> = Partial<ServiceCallArgsAlpha<TQueryParams>>;

// export type IndexArgs = Omit<ServiceCallArgs<{locationName?: string}>, "headers" | "body">;
export type IndexArgs = Partial<Pick<Target, "locationName">>;

export type StoreArgs = StoreBody & {
	photo: Blob;
};

export type ShowArgs = {
	id: Target["customId"]
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
			headers: getServicesAuthHeaders()
		};

		const url = new URL(Environment.getInstance().targetServiceUrl);

		if (args && args.locationName) {
			const searchParams = url.searchParams;
			makeTypedSearchParams<IndexArgs>(searchParams, args);
		}

		return await defaultServiceCall(url, fetchInit);
	}

	public static async store(args: StoreArgs) {
		const myHeaders = getServicesAuthHeaders();
		// myHeaders.set("Content-Type", "multipart/form-data");

		const formDataAlpha = makeTypedFormData<StoreArgs>(args);

		const fetchInit: RequestInit = {
			method: "post",
			headers: myHeaders,
			body: formDataAlpha as FormData
		};

		const url = new URL(Environment.getInstance().targetServiceUrl);

		return await defaultServiceCall(url, fetchInit);
	}

	public static async show(args: ShowArgs): Promise<Response> {
		const fetchInit: RequestInit = {
			method: "get",
			headers: getServicesAuthHeaders()
		};

		let url = new URL(Environment.getInstance().targetServiceUrl);
		url = new URL(args.id, url);

		return await defaultServiceCall(url, fetchInit);
	}

}
