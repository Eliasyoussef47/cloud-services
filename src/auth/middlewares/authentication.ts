import { Express } from "express";
import { AuthServiceAlpha } from "@/auth/AuthServiceAlpha.js";
import passport from "passport";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

export function setupUserAuthenticationMiddlewares(expressApp: Express, authService: AuthServiceBeta) {
	passport.use("userJwt", authService.authenticateUserStrategy);

	expressApp.use(passport.initialize());
	expressApp.use(passport.authenticate("userJwt", { session: false }));
}

export function setupGatewayAuthenticationMiddlewares(expressApp: Express, authService: AuthServiceAlpha) {
	passport.use("gatewayJwt", authService.authenticateGatewayStrategy);

	expressApp.use(passport.initialize());
	expressApp.use(passport.authenticate("gatewayJwt", { session: false }));
}
