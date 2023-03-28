import crypto from "crypto";
import { ExtractJwt, StrategyOptions } from "passport-jwt";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import jwt from "jsonwebtoken";
import { Environment } from "@/shared/operation/Environment.js";

export interface User {
	id: string;
	customIid: string;
	username: string;
	password: string;
}

export interface LoginForm {
	username: string;
	password: string;
}

// TODO: Add expiration date.
export interface UserJwtPayload {
	sub: string;
}

export interface ServicesJwtPayload {
	key: string;
}

// TODO: Remove temp database.
const users: Array<User> = [
	{
		id: "420",
		customIid: "456",
		username: "elias",
		password: "jeff"
	}
];

export class AuthService {
	static #instance: AuthService | undefined;

	private static readonly _saltSize = 16;

	private static readonly _iterations = 1000;

	private static readonly _keyLength = 64;

	private static readonly _digest = "sha512";

	private static readonly _encoding = "hex";

	private readonly _jwtOptions: StrategyOptions;

	constructor(jwtOptions: StrategyOptions) {
		this._jwtOptions = jwtOptions;
	}

	public get jwtOptions(): StrategyOptions {
		return this._jwtOptions;
	}

	public static getInstance(): AuthService {
		return this.#instance!;
	}

	public static setInstance(value: AuthService) {
		this.#instance = value;
	}

	public static getInstanceUndefined(): AuthService | undefined {
		return this.#instance;
	}

	public static setup() {
		const jwtOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: Environment.getInstance().envFile.JWT_USERS_SECRET
		} satisfies StrategyOptions;

		this.setInstance(new AuthService(jwtOptions));
	}

	public static createPassword(suppliedPassword: string) {
		const salt = crypto.randomBytes(this._saltSize).toString(this._encoding);
		const hash = crypto.pbkdf2Sync(suppliedPassword, salt,
			this._iterations, this._keyLength, this._digest).toString(this._encoding);
		return `${hash}.${salt}`;
	}

	public static verifyPassword(storedPassword: string, suppliedPassword: string) {
		const [hashedPassword, salt] = storedPassword.split(".");
		const hashedPasswordBuf = Buffer.from(hashedPassword, this._encoding);
		const suppliedPasswordBuf = crypto.pbkdf2Sync(suppliedPassword,
			salt, this._iterations, this._keyLength, this._digest);
		return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
	}

	/**
	 *
	 * @param payload
	 * @throws {CustomError}
	 */
	public async getMatchingUser(payload: UserJwtPayload): Promise<User> {
		const foundUser = users.find((value, index, obj) => {
			return value.customIid == payload.sub;
		});

		if (!foundUser) {
			throw new CustomError("Invalid user");
		}

		return foundUser;
	}

	public login(loginForm: LoginForm): string | undefined {
		const foundUser = users.find((value, index, obj) => {
			return value.username == loginForm.username;
		});

		if (!foundUser) {
			return undefined;
		}

		if (foundUser.password != loginForm.password) {
			return undefined;
		}

		foundUser.customIid = crypto.randomUUID();

		const jwtPayload: UserJwtPayload = {
			sub: foundUser.customIid
		};

		return jwt.sign(jwtPayload, <string> this.jwtOptions.secretOrKey);
	}
}
