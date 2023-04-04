import { IMessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/MessageBroker.js";
import { Channel, Connection, Replies } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { MessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/helperClasses.js";

export class AuthServiceMessageBroker implements IMessageBrokerUserCreatedPublisher {
	private _messageBrokerUserCreatedPublisher: IMessageBrokerUserCreatedPublisher;

	constructor() {
		this._messageBrokerUserCreatedPublisher = new MessageBrokerUserCreatedPublisher();
	}

	public get connection(): Connection | undefined {
		return this._messageBrokerUserCreatedPublisher.connection;
	}

	public set connection(value: Connection | undefined) {
		this._messageBrokerUserCreatedPublisher.connection = value;
	}

	public get channel(): Channel | undefined {
		return this._messageBrokerUserCreatedPublisher.channel;
	}

	public set channel(value: Channel | undefined) {
		this._messageBrokerUserCreatedPublisher.channel = value;
	}

	public exchangeAlpha: Replies.AssertExchange | undefined;

	public async assertExchanges(): Promise<boolean> {
		return this._messageBrokerUserCreatedPublisher.assertExchanges();
	}

	public connect(url: string): Promise<Connection | undefined> {
		return this._messageBrokerUserCreatedPublisher.connect(url);
	}

	public createChannel(): Promise<Channel | undefined> {
		return this._messageBrokerUserCreatedPublisher.createChannel();
	}

	public publish(routingKey: RoutingKey, msg: string): boolean {
		return this._messageBrokerUserCreatedPublisher.publish(routingKey, msg);
	}
}
