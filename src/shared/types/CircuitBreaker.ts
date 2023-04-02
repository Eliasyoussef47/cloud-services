import CircuitBreaker from "opossum";
import { NextFunction, Request, Response } from "express-serve-static-core";

// TODO: Probably no longer needed.
export type CircuitBreakerRequestHandler = CircuitBreaker<[Request, Response, NextFunction], void>;
