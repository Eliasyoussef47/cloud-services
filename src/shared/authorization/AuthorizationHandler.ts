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
