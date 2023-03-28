import * as process from "process";
import { AuthService } from "@/auth/AuthService.js";

const args = process.argv;

const suppliedPassword = args[2];

const pass = AuthService.createPassword(suppliedPassword);

console.log(pass);
