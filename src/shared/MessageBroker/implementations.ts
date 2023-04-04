import { IMessageBrokerUser, IMessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/MessageBroker.js";
import { Channel, Connection, Replies } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { MessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/helperClasses.js";

export class AuthServiceMessageBroker implements IMessageBrokerUserCreatedPublisher {
	public exchangeAlpha: Replies.AssertExchange | undefined;
	private _messageBrokerUserCreatedPublisher: IMessageBrokerUserCreatedPublisher;

	constructor(messageBrokerUser: IMessageBrokerUser) {
		this._messageBrokerUserCreatedPublisher = new MessageBrokerUserCreatedPublisher(messageBrokerUser);
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

	public async assertExchanges(): Promise<boolean> {
		return this._messageBrokerUserCreatedPublisher.assertExchanges();
	}

	public connect(url: string): Promise<Connection | undefined> {
		return this._messageBrokerUserCreatedPublisher.connect(url);
	}

	public createChannel(): Promise<Channel | undefined> {
		return this._messageBrokerUserCreatedPublisher.createChannel();
	}

	public publish(routingKey: RoutingKey, msg: string, exchange: string = "alpha"): boolean {
		return this._messageBrokerUserCreatedPublisher.publish(routingKey, msg);
	}
}

