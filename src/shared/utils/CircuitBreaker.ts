import { AsyncRequestHandler } from "@/types/express/index.js";
import { CircuitBreakerRequestHandler } from "@/shared/types/CircuitBreaker.js";

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
