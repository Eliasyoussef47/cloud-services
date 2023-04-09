import { AuthServiceBeta } from "@/auth/AuthServiceBeta.js";
import { LoginForm } from "@/auth/AuthServiceAlpha.js";

describe("AuthServiceBeta", () => {
	describe("createPassword", () => {
		it("should create a password hash with the correct format", () => {
			const password = "password123";
			const passwordHash = AuthServiceBeta.createPassword(password);
			expect(passwordHash).toMatch(/^[a-f0-9]{128}\.[a-f0-9]{32}$/);
		});
	});

	describe("verifyPassword", () => {
		it("should return true for a correct password", () => {
			const password = "password123";
			const passwordHash = AuthServiceBeta.createPassword(password);
			const isCorrectPassword = AuthServiceBeta.verifyPassword(passwordHash, password);
			expect(isCorrectPassword).toBe(true);
		});

		it("should return false for an incorrect password", () => {
			const password = "password123";
			const passwordHash = AuthServiceBeta.createPassword(password);
			const isCorrectPassword = AuthServiceBeta.verifyPassword(passwordHash, "incorrectpassword");
			expect(isCorrectPassword).toBe(false);
		});
	});
});