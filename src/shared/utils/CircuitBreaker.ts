import { AsyncRequestHandler } from "@/types/express/index.js";
import { CircuitBreakerRequestHandler } from "@/shared/types/CircuitBreaker.js";
import CircuitBreaker from "opossum";
import createHttpError from "http-errors";

// TODO: Probably no longer needed.
export const makeCircuitBreakerRequestHandler = (circuitBreaker: CircuitBreakerRequestHandler): AsyncRequestHandler => {
	return async (req, res, next) => {
		return circuitBreaker.fire(req, res, next)
			.then((r) => {
				console.log("Service breaker resolved:", r);
				return res;
				// res.json(r);
			})
			.catch((e) => {
				console.error("Service breaker rejected: ", e);
				next(e);
			});
	};
};

export const attachStandardCircuitBreakerCallbacks = (circuitBreaker: CircuitBreaker, circuitBreakerName: string = "Circuit breaker") => {
	circuitBreaker.fallback((e) => {
		if (e instanceof Error) {
			throw e;
		} else {
			console.log("fallback e is not an instance of Error:");
			console.log(e);
			throw createHttpError(503, "ServiceUnavailable");
		}
	});
	// TODO: Disable unneeded callbacks.
	circuitBreaker.on("fallback", (result) => {
		console.log(`${circuitBreakerName}: fallback: `, result);
	});
	circuitBreaker.on("success", () => console.log(`${circuitBreakerName}: success`));
	circuitBreaker.on("failure", () => console.log(`${circuitBreakerName}: failed`));
	circuitBreaker.on("timeout", () => console.log(`${circuitBreakerName}: timed out`));
	circuitBreaker.on("reject", () => console.log(`${circuitBreakerName}: rejected`));
	circuitBreaker.on("open", () => console.log(`${circuitBreakerName}: opened`));
	circuitBreaker.on("halfOpen", () => console.log(`${circuitBreakerName}: halfOpened`));
	circuitBreaker.on("close", () => console.log(`${circuitBreakerName}: closed`));
};
