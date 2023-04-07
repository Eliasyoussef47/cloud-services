import { IMessagePublisher } from "@/shared/MessageBroker/MessageBroker.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { UserCreatedBody, UserCreatedMessage } from "@/shared/MessageBroker/messages.js";
import { exchangeAlphaName, ExchangeName } from "@/shared/MessageBroker/constants.js";
import { MessageBroker } from "@/shared/MessageBroker/MessageBrokerGod.js";
import { Options } from "amqplib/properties.js";

export class AuthServiceMessageBroker implements IMessagePublisher {
	private _messageBroker: MessageBroker;

	constructor(messageBroker: MessageBroker) {
		this._messageBroker = messageBroker;
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		return this._messageBroker.publish(routingKey, msg);
	}

	public publishToQueue(queueName: string, msg: string, options: Options.Publish = {}): boolean {
		return this._messageBroker.publishToQueue(queueName, msg, options);
	}

	public publishUserCreated(message: UserCreatedBody): boolean {
		const completeMessage: UserCreatedMessage = {
			type: "User",
			status: "created",
			data: message
		};
		return this.publishUserCreatedBase(completeMessage);
	}

	private publishUserCreatedBase(message: UserCreatedMessage): boolean {
		return this.publish("users.*.created", JSON.stringify(message));
	}
}
