import { RequestHandler } from "express-serve-static-core";

export enum AuthorizationState {
	GRANTED,
	DENIED,
	UNDETERMINED
}

export const authorizationSetup: RequestHandler = (req, res, next) => {
	res.locals.authorizationState = AuthorizationState.UNDETERMINED;

	next();
};

declare global {
	namespace Express {
		interface Locals {
			authorizationState: AuthorizationState
		}
	}
}

export function authWrapper(requestHandler: RequestHandler): RequestHandler {
	return async (req, res, next) => {
		if (res.locals.authorizationState === AuthorizationState.GRANTED) {
			next();
			return;
		}

		return requestHandler(req, res, next);
	};
}
