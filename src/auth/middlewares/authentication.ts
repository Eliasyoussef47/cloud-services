import { Express } from "express";
import { AuthService } from "@/auth/AuthService.js";
import passport from "passport";

export function setupUserAuthenticationMiddlewares(expressApp: Express, authService: AuthService) {
	passport.use("userJwt", authService.authenticateUserStrategy);

	expressApp.use(passport.initialize());
	expressApp.use(passport.authenticate("userJwt", { session: false }));
}

export function setupGatewayAuthenticationMiddlewares(expressApp: Express, authService: AuthService) {
	passport.use("gatewayJwt", authService.authenticateGatewayStrategy);

	expressApp.use(passport.initialize());
	expressApp.use(passport.authenticate("gatewayJwt", { session: false }));
}
