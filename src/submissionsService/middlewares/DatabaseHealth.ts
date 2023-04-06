import { RequestHandler } from "express-serve-static-core";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import Database from "@/shared/persistence/mongoose/Database.js";

export const databaseHealth: RequestHandler = (req, res, next) => {
	// Hier kan er nog meer gecheckt worden om te voorkomen dat er een error ontstaat verder in de applicatie. Enige
	// nadeel is dat dit met elke request uitgevoerd wordt.
	if (Database.getInstance().connection == undefined) {
		throw new CustomError("Database connection is not established");
	}

	next();
};
