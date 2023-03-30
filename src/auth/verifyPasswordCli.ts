import * as process from "process";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

const args = process.argv;

const storedPassword = args[2];
const suppliedPassword = args[3];

const success = AuthServiceBeta.verifyPassword(storedPassword, suppliedPassword);

console.log(success);
