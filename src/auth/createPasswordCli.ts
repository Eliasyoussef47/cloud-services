import * as process from "process";
import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";

const args = process.argv;

const suppliedPassword = args[2];

const pass = AuthServiceBeta.createPassword(suppliedPassword);

console.log(pass);
