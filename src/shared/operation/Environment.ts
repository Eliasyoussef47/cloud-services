import * as process from "process";
import { toZod } from "tozod";
import z from "zod";
import { uploadedSubmissionsPath, uploadedTargetsPath } from "@/shared/constants.js";

export interface Env {
	JWT_USERS_SECRET: string;
	JWT_GATEWAY_SECRET: string;
	SERVICES_API_KEY: string;
	IMAGGA_API_KEY: string;
	IMAGGA_API_SECRET: string;
	MESSAGE_BROKER_URL: string;
	API_GATEWAY_URL: string;
	TARGETS_SERVICE_URL: string;
	SUBMISSIONS_SERVICE_URL: string;
	IMAGE_RECOGNITION_SERVICE_URL: string;
	JWT_EXPIRES_IN: number;
	AUTH_DATABASE_PATH: string;
	TARGETS_DATABASE_PATH: string;
	SUBMISSIONS_DATABASE_PATH: string;
}

export const stringWithValueSchema = z.string().min(1, "Environment variable must have a value.");
export const urlSchema = stringWithValueSchema.url("Environment variable must be a valid URL.");

export const envFileSchema: toZod<Env> = z.object({
	JWT_USERS_SECRET: stringWithValueSchema,
	JWT_GATEWAY_SECRET: stringWithValueSchema,
	SERVICES_API_KEY: stringWithValueSchema,
	IMAGGA_API_KEY: stringWithValueSchema,
	IMAGGA_API_SECRET: stringWithValueSchema,
	MESSAGE_BROKER_URL: urlSchema,
	API_GATEWAY_URL: urlSchema,
	TARGETS_SERVICE_URL: urlSchema,
	SUBMISSIONS_SERVICE_URL: urlSchema,
	IMAGE_RECOGNITION_SERVICE_URL: urlSchema,
	JWT_EXPIRES_IN: z.coerce.number(),
	AUTH_DATABASE_PATH: urlSchema,
	TARGETS_DATABASE_PATH: urlSchema,
	SUBMISSIONS_DATABASE_PATH: urlSchema,
});

export class Environment {
	static #instance: Environment | undefined;
	readonly #envFile: Env;

	constructor(envFile: Env) {
		this.#envFile = envFile;
	}

	public get apiGatewayUrl(): URL {
		return new URL(this.#envFile.API_GATEWAY_URL);
	}

	public get targetServiceUrl(): URL {
		return new URL(this.#envFile.TARGETS_SERVICE_URL);
	}

	public get submissionServiceUrl(): URL {
		return new URL(this.#envFile.SUBMISSIONS_SERVICE_URL);
	}

	public get targetUploadsUrl(): URL {
		return new URL(uploadedTargetsPath, this.targetServiceUrl);
	}

	public get submissionUploadsUrl(): URL {
		return new URL(uploadedSubmissionsPath, this.submissionServiceUrl);
	}

	public get envFile(): Env {
		return this.#envFile;
	}

	public static getInstance(): Environment {
		return this.#instance!;
	}

	public static setInstance(value: Environment) {
		this.#instance = value;
	}

	public static setup() {
		const envFile: Env = {
			JWT_USERS_SECRET: process.env.JWT_USERS_SECRET || "",
			JWT_GATEWAY_SECRET: process.env.JWT_GATEWAY_SECRET || "",
			SERVICES_API_KEY: process.env.SERVICES_API_KEY || "",
			IMAGGA_API_KEY: process.env.IMAGGA_API_KEY || "",
			IMAGGA_API_SECRET: process.env.IMAGGA_API_SECRET || "",
			MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL || "",
			API_GATEWAY_URL: process.env.API_GATEWAY_URL || "",
			TARGETS_SERVICE_URL: process.env.TARGETS_SERVICE_URL || "",
			SUBMISSIONS_SERVICE_URL: process.env.SUBMISSIONS_SERVICE_URL || "",
			IMAGE_RECOGNITION_SERVICE_URL: process.env.IMAGE_RECOGNITION_SERVICE_URL || "",
			JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN) || 10800,
			AUTH_DATABASE_PATH: process.env.AUTH_DATABASE_PATH || "",
			TARGETS_DATABASE_PATH: process.env.TARGETS_DATABASE_PATH || "",
			SUBMISSIONS_DATABASE_PATH: process.env.SUBMISSIONS_DATABASE_PATH || ""
		}

		envFileSchema.parse(envFile);

		this.setInstance(new Environment(envFile));
	}
}
