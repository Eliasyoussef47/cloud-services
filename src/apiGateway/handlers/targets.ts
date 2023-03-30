import { AuthService } from "@/auth/AuthService.js";
import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { RequestHandler } from "express-serve-static-core";

export default class TargetHandler {
	public static post: RequestHandler = async (req, res) => {
		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		myHeaders.append("Authorization", `Bearer ${AuthService.getInstance().gatewayJwt}`);

		const fetchInit = {
			method: "post",
			headers: myHeaders,
			body: req.body
		};

		let fetchResult;

		try {
			fetchResult = await fetch(Environment.getInstance().targetServiceUrl, fetchInit);
		} catch (e) {
			if (e instanceof Object) {
				console.log(`Error door fetch ${e.toString()}`);
			} else {
				console.log(`Error door fetch ${e}`);
			}
			throw createHttpError(500, "Error during request to microservice");
		}

		if (fetchResult.status >= 400) {
			throw createHttpError(fetchResult.status, fetchResult.statusText);
		}

		res.status(fetchResult.status).json(await fetchResult.json());
	}
}


