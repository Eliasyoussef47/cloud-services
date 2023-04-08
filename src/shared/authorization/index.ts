import { GatewayJwtUser } from "@/auth/AuthServiceAlpha.js";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RequestHandler } from "express-serve-static-core";
import { AuthorizationState } from "@/shared/authorization/AuthorizationHandler.js";

// export const defaultFailureHandler: FailureHandler = (req, res, action) => {
// 	console.log("action", action);
// 	throw createHttpError(403, "User doesn't satisfy the authorization rules.");
// };
//
// export const authorizationOption: Options = {
// 	failureHandler: defaultFailureHandler
// };
//
// export const getDefaultAuthorization = () => {
// 	return new ConnectRoles(authorizationOption);
// };

// export const rolesAuthorization = getDefaultAuthorization();
//
// rolesAuthorization.use((req) => {
// 	const user = req.user as (GatewayJwtUser | undefined);
// 	if (!user) {
// 		throw new CustomError("User wasn't found in the locals.");
// 	}
//
// 	if (user.role == "admin") {
// 		return true;
// 	}
// });

export const isAdmin: RequestHandler = (req, res, next) => {
	if (res.locals.authorizationState === AuthorizationState.GRANTED) {
		next();
	}

	const user = req.user as (GatewayJwtUser | undefined);
	if (!user) {
		throw new CustomError("User wasn't found in the locals.");
	}

	if (user.role == "admin") {
		res.locals.authorizationState = AuthorizationState.GRANTED;
	}

	next();
};
