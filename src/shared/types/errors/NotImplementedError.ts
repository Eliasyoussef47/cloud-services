export default class NotImplementedError extends Error {
	constructor(message?: string) {
		super(message ?? "Method/property is not implemented.");
	}
}
