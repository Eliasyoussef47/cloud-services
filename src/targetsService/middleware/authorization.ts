import { Target } from "@/targetsService/models/Target.js";
import { GatewayJwtUser } from "@/auth/AuthServiceAlpha.js";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RequestHandler } from "express-serve-static-core";
import { getDefaultAuthorizationError } from "@/shared/operation/errorHandling.js";
import { AuthorizationState } from "@/shared/authorization/AuthorizationHandler.js";

// export const userAuthorizationTargetsService = getDefaultAuthorization();
//
// userAuthorizationTargetsService.use("ownsTarget", (req) => {
// 	const target = req.res?.locals.target as (Target | undefined);
// 	const user = req.user as (GatewayJwtUser | undefined);
// 	if (!target) {
// 		throw new CustomError("Target wasn't found in the locals.");
// 	}
// 	if (!user) {
// 		throw new CustomError("User wasn't found in the locals.");
// 	}
//
// 	if (target.userId == user.customId) {
// 		return true;
// 	}
// });

export const ownsTarget: RequestHandler = (req, res, next) => {
	if (res.locals.authorizationState === AuthorizationState.GRANTED) {
		next();
		return;
	}

	const target = res?.locals.target as (Target | undefined);
	const user = req.user as (GatewayJwtUser | undefined);
	if (!target) {
		throw new CustomError("Target wasn't found in the locals.");
	}
	if (!user) {
		throw new CustomError("User wasn't found in the locals.");
	}

	if (target.userId != user.customId) {
		// res.locals.authorizationState = AuthorizationState.DENIED;
		next(getDefaultAuthorizationError());
		return;
	}

	res.locals.authorizationState = AuthorizationState.UNDETERMINED;
	next();
};
