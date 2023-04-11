import { CustomError } from "@/shared/types/errors/CustomError.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { GatewayJwtPayloadManual, LoginForm, UserJwtPayload } from "@/auth/AuthServiceAlpha.js";
import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { Environment } from "@/shared/operation/Environment.js";
import createHttpError from "http-errors";
import { AuthServiceBase } from "@/auth/AuthServiceBase.js";
import { User } from "@/auth/models/User.js";
import ServicesRegistry from "@/auth/ServicesRegistry.js";
import { UserPersistent } from "@/auth/persistence/IUserRepository.js";

/**
 * Responsible for authentication in the API gateway (user).
 */
export class AuthServiceBeta extends AuthServiceBase {
	static #instance: AuthServiceBeta | undefined;

	private static readonly _saltSize = 16;

	private static readonly _iterations = 1000;

	private static readonly _keyLength = 64;

	private static readonly _digest = "sha512";

	private static readonly _encoding = "hex";

	private readonly _userJwtOptions: StrategyOptions;

	private readonly _authenticateUserStrategy: JwtStrategy;

	private readonly jwtExpiresIn: number = 10800;

	constructor(gatewayJwtOptions: StrategyOptions, userJwtOptions: StrategyOptions) {
		super(gatewayJwtOptions);

		this.jwtExpiresIn = Environment.getInstance().envFile.JWT_EXPIRES_IN;
		this._userJwtOptions = userJwtOptions;

		this._authenticateUserStrategy = new JwtStrategy(this.userJwtOptions, (payload, done) => {
			// Validate if the user exists. Otherwise, send 407 error.
			this.getMatchingUser(payload)
				.then((value) => {
					ServicesRegistry.getInstance().user = value;
					return done(null, value);
				})
				.catch((e) => {
					ServicesRegistry.getInstance().user = undefined;
					done(createHttpError(407, e), false);
				});
		});
	}

	public get userJwtOptions(): StrategyOptions {
		return this._userJwtOptions;
	}

	public get authenticateUserStrategy(): JwtStrategy {
		return this._authenticateUserStrategy;
	}

	public static getInstance(): AuthServiceBeta {
		return this.#instance!;
	}

	public static setInstance(value: AuthServiceBeta) {
		this.#instance = value;
	}

	public static setup() {
		const gatewayJwtOptions = AuthServiceBase.getDefaultGatewayJwtOptions();
		const userJwtOptions = AuthServiceBase.getDefaultUserJwtOptions();

		this.setInstance(new AuthServiceBeta(gatewayJwtOptions, userJwtOptions));
	}

	public static createPassword(suppliedPassword: string): string {
		const salt = crypto.randomBytes(this._saltSize).toString(this._encoding);
		const hash = crypto.pbkdf2Sync(suppliedPassword, salt,
			this._iterations, this._keyLength, this._digest).toString(this._encoding);
		return `${hash}.${salt}`;
	}

	public static verifyPassword(storedPassword: string, suppliedPassword: string): boolean {
		const [hashedPassword, salt] = storedPassword.split(".");
		const hashedPasswordBuf = Buffer.from(hashedPassword, this._encoding);
		const suppliedPasswordBuf = crypto.pbkdf2Sync(suppliedPassword,
			salt, this._iterations, this._keyLength, this._digest);
		return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
	}

	public getGatewayJwt(user: User): string {
		const gatewayJwtPayload: GatewayJwtPayloadManual = {
			key: Environment.getInstance().envFile.SERVICES_API_KEY,
			sub: user.customId,
			role: user.role
		};

		return jwt.sign(gatewayJwtPayload, <string> this.gatewayJwtOptions.secretOrKey);
	}

	/**
	 *
	 * @param payload
	 * @throws {CustomError}
	 */
	public async getMatchingUser(payload: UserJwtPayload): Promise<User> {
		let foundUser: UserPersistent | null;
		try {
			foundUser = await ServicesRegistry.getInstance().userRepository.getByOpaqueId(payload.sub);
		} catch (e) {
			console.error("Error while getting a user.", e);
			throw e;
		}

		if (!foundUser) {
			throw new CustomError("Invalid user");
		}

		return foundUser.toObject();
	}

	public async register(loginForm: LoginForm) {
		const customId = crypto.randomUUID();
		const opaqueId = crypto.randomUUID();
		const password = AuthServiceBeta.createPassword(loginForm.password);

		try {
			return await ServicesRegistry.getInstance().userRepository.create({ customId, opaqueId, username: loginForm.username, password });
		} catch (e) {
			console.error("Error while creating user.", e);
			return undefined;
		}
	}

	public async login(loginForm: LoginForm): Promise<{ jwt: string; user: UserPersistent } | undefined> {
		let foundUser: UserPersistent | null = null;
		try {
			foundUser = await ServicesRegistry.getInstance().userRepository.getByUsername(loginForm.username);
		} catch (e) {
			console.error("Error while getting a user.", e);
		}

		if (!foundUser) {
			return undefined;
		}

		if (!AuthServiceBeta.verifyPassword(foundUser.password, loginForm.password)) {
			return undefined;
		}

		foundUser.opaqueId = crypto.randomUUID();
		await foundUser.save();

		const newJwt = jwt.sign({}, <string> this.userJwtOptions.secretOrKey,
			{
				expiresIn: this.jwtExpiresIn,
				subject: foundUser.opaqueId
			});

		return {
			user: foundUser,
			jwt: newJwt
		};
	}
}
