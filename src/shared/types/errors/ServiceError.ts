export class ServiceError extends Error {
	module: string;
	// For some reason, Express doesn't return message and stack with the respons so this fields will have to do.
	moduleMessage: string;

	constructor(module: string, message: string) {
		super(message);
		this.module = module;
		this.moduleMessage = message;
	}
}

export class DatabaseError extends ServiceError {
	constructor(message: string) {
		super("Database", message);
	}
}
