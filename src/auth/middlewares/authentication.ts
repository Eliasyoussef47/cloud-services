import { Express } from "express";
import { AuthService } from "@/auth/AuthService.js";
import createHttpError from "http-errors";
import passport from "passport";
import passportJwt from "passport-jwt";

export function setupAuthenticationMiddlewares(expressApp: Express, authService: AuthService) {
	const JwtStrategy = passportJwt.Strategy;
	const authenticateUserStrategy = new JwtStrategy(authService.jwtOptions, (payload, done) => {
		authService.getMatchingUser(payload)
			.then((value) => {
				return done(null, value);
			})
			.catch((e) => {
				done(createHttpError(401, e), false);
			});
	});

	passport.use(authenticateUserStrategy);

	expressApp.use(passport.initialize());
	expressApp.use(passport.authenticate("jwt", { session: false }));
}
