/**
 * An error that displays the stack when converted to Json.
 */
export class CustomError extends Error {
	constructor(message: string) {
		super(message);
	}

	public toJSON() {
		let alt = {};

		Object.getOwnPropertyNames(this).forEach(function (key) {
			if (key == "stack") {
				// @ts-ignore
				const oldStack = <string> (this)[key];
				let arrayStack = oldStack.split("\n");
				arrayStack = arrayStack.map((value) => {
					return value.trim();
				});
				// @ts-ignore
				alt[key] = arrayStack;
				return;
			}
			// @ts-ignore
			alt[key] = this[key];
		}, this);

		return alt;
	}
}
