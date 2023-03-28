import * as process from "process";
import { AuthService } from "@/auth/AuthService.js";

const args = process.argv;

const storedPassword = args[2];
const suppliedPassword = args[3];

const success = AuthService.verifyPassword(storedPassword, suppliedPassword);

console.log(success);
