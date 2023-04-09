import request from 'supertest';
import { TargetsServiceMessageBroker } from '../MessageBroker/MessageBroker.js';
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";

describe("TargetsServiceMessageBroker", () => {
	let messageBroker: MessageBroker;
	let targetsServiceMessageBroker: TargetsServiceMessageBroker;

	beforeEach(() => {
		messageBroker = new MessageBroker();
		targetsServiceMessageBroker = new TargetsServiceMessageBroker(messageBroker);
	});

	describe("setupQueues", () => {
		it("should call setupTargetsServiceQueue on messageBroker", async () => {
			messageBroker.setupTargetsServiceQueue = jest.fn();

			await targetsServiceMessageBroker.setupQueues();

			expect(messageBroker.setupTargetsServiceQueue).toHaveBeenCalled();
		});
	});

	describe("setup", () => {
		it("should call assertExchanges, setupQueues, and consume", async () => {
			targetsServiceMessageBroker.assertExchanges = jest.fn().mockResolvedValue(true);
			targetsServiceMessageBroker.setupQueues = jest.fn().mockResolvedValue(true);
			targetsServiceMessageBroker.consume = jest.fn();

			await targetsServiceMessageBroker.setup();

			expect(targetsServiceMessageBroker.assertExchanges).toHaveBeenCalled();
			expect(targetsServiceMessageBroker.setupQueues).toHaveBeenCalled();
			expect(targetsServiceMessageBroker.consume).toHaveBeenCalled();
		});
	});
});