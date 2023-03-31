import mongoose, { Connection } from "mongoose";
import { Environment } from "@/shared/operation/Environment.js";

export default class Database {
	static #instance: Database;
	readonly #connection: Connection;

	constructor(connection: Connection) {
		this.#connection = connection;
	}

	public get connection(): Connection {
		return this.#connection;
	}

	public static getInstance(): Database {
		return this.#instance!;
	}

	public static setInstance(value: Database) {
		this.#instance = value;
	}

	public static async setup() {
		const connection = await mongoose.createConnection(Environment.getInstance().envFile.AUTH_DATABASE_PATH).asPromise();

		this.setInstance(new Database(connection));
	}
}
