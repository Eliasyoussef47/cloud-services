import { isProd } from "@/shared/ErrorHandlers.js";

if (!('toJSON' in Error.prototype) && isProd()) {
	Object.defineProperty(Error.prototype, 'toJSON', {
		value: function () {
			const alt = {};

			Object.getOwnPropertyNames(this).forEach(function (key) {
				// @ts-ignore
				alt[key] = this[key];
			}, this);

			return alt;
		},
		configurable: true,
		writable: true
	});
}
