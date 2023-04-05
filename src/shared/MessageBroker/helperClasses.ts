import { IAssertsExchanges, IMessageBrokerUser, IMessageBrokerUserCreatedPublisher } from "@/shared/MessageBroker/MessageBroker.js";
import amqp, { Channel, Connection, Replies } from "amqplib";
import { CustomError } from "@/shared/types/errors/CustomError.js";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { exchangeAlphaName, exchangeAlphaParams, ExchangeName } from "@/shared/MessageBroker/constants.js";

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

	public publish(routingKey: RoutingKey, msg: string, exchange: ExchangeName = exchangeAlphaName): boolean {
		try {
			const channel = this.channel;
			if (!channel) {
				return false;
				// throw new CustomError("Channel not constructed.");
			}

			// Messages are persistent so they are written to disk. This ensures that messages are not lost after system restart.
			return channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
		} catch (error) {
			console.log("Error while publishing : " + error);
			return false;
		}
	}
}

export class MessageBrokerUserCreatedPublisher implements IMessageBrokerUserCreatedPublisher {
	public exchangeAlpha: Replies.AssertExchange | undefined;
	private _messageBrokerUser: IMessageBrokerUser;

	constructor(messageBrokerUser: IMessageBrokerUser) {
		this._messageBrokerUser = messageBrokerUser;
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

	public publish(routingKey: RoutingKey, msg: string, exchange: string = "alpha"): boolean {
		return this._messageBrokerUser.publish(routingKey, msg);
	}
}

export class BindExchange_A_D implements IAssertsExchanges {
	private readonly _channel: Channel | undefined;
	private readonly _exchangeAlpha: Replies.AssertExchange | undefined;
	private readonly _exchangeDelta: Replies.AssertExchange | undefined;

	constructor(channel: Channel, exchangeAlpha: Replies.AssertExchange, exchangeDelta: Replies.AssertExchange) {
		this._channel = channel;
		this._exchangeAlpha = exchangeAlpha;
		this._exchangeDelta = exchangeDelta;
	}

	public async assertExchanges(): Promise<boolean> {
		try {
			if (!this._channel || !this._exchangeAlpha || !this._exchangeDelta) {
				return false;
			}

			await this._channel?.bindExchange(this._exchangeDelta.exchange, this._exchangeAlpha.exchange, <RoutingKey> "users.*.created");

			return true;
		} catch (e) {
			return false;
		}
	}
}

export class BindExchange_A_C implements IAssertsExchanges {
	private readonly _channel: Channel | undefined;
	private readonly _exchangeAlpha: Replies.AssertExchange | undefined;
	private readonly _exchangeCharlie: Replies.AssertExchange | undefined;

	constructor(channel: Channel, exchangeAlpha: Replies.AssertExchange, exchangeCharlie: Replies.AssertExchange) {
		this._channel = channel;
		this._exchangeAlpha = exchangeAlpha;
		this._exchangeCharlie = exchangeCharlie;
	}

	public async assertExchanges(): Promise<boolean> {
		try {
			if (!this._channel || !this._exchangeAlpha || !this._exchangeCharlie) {
				return false;
			}

			await this._channel?.bindExchange(this._exchangeCharlie.exchange, this._exchangeAlpha.exchange, <RoutingKey> "*.image.processed");

			return true;
		} catch (e) {
			return false;
		}
	}
}
