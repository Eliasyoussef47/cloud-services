import { IMessageBrokerUser, IMessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/MessageBroker.js";
import amqp, { Channel, Connection, Replies } from "amqplib";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import NotImplementedError from "@/shared/types/errors/NotImplementedError.js";
import { exchangeAlphaParams } from "@/shared/MessageBroker/constants.js";

export class MessageBrokerUser implements IMessageBrokerUser {
	public connection: Connection | undefined;
	public channel: Channel | undefined;

	public async connect(url: string): Promise<Connection | undefined> {
		this.connection = await amqp.connect(url);
		return this.connection;
	}

	public async createChannel(): Promise<Channel | undefined> {
		if (!this.connection) {
			throw new CustomError("Message broker connection has not been established");
		}

		try {
			this.channel = await this.connection.createChannel();
		} catch (e) {
			console.log("Failed to create message broker channel.");
		}
		return this.channel;
	}

	public publish(routingKey: RoutingKey, msg: string): boolean {
		throw new NotImplementedError();
	}
}

export class MessageBrokerUserCreatedPublisher implements IMessageBrokerUserCreatedPublisher {
	private _messageBrokerUser: IMessageBrokerUser;

	constructor() {
		this._messageBrokerUser = new MessageBrokerUser();
	}

	public get connection(): Connection | undefined {
		return this._messageBrokerUser.connection;
	}

	public set connection(value: Connection | undefined) {
		this._messageBrokerUser.connection = value;
	}

	public get channel(): Channel | undefined {
		return this._messageBrokerUser.channel;
	}

	public set channel(value: Channel | undefined) {
		this._messageBrokerUser.channel = value;
	}

	public exchangeAlpha: Replies.AssertExchange | undefined;

	public async assertExchanges(): Promise<boolean> {
		this.exchangeAlpha = await this.channel?.assertExchange(...exchangeAlphaParams);

		// TODO: Return false if any of the exchanges failed.
		return true;
	}

	public connect(url: string): Promise<Connection | undefined> {
		return this._messageBrokerUser.connect(url);
	}

	public createChannel(): Promise<Channel | undefined> {
		return this._messageBrokerUser.createChannel();
	}

	public publish(routingKey: RoutingKey, msg: string): boolean {
		return this._messageBrokerUser.publish(routingKey, msg);
	}
}

