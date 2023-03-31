import ILogger from "@/shared/Logger/ILogger.js";

export default class StandardLogger implements ILogger {
	public error(data: any): void {
		console.error(data);
	}

	public log(data: any): void {
		console.log(data);
	}

}
