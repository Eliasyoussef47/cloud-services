import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { RequestHandler } from "express-serve-static-core";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { ResponseBody } from "@/shared/types/Response.js";

export default class TargetHandler {
	public static index: RequestHandler = async (req, res) => {

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


