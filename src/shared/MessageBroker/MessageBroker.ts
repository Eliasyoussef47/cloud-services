import { Channel, Connection, Replies } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { ExchangeName } from "@/shared/MessageBroker/constants.js";
import { Options } from "amqplib/properties.js";

export interface IMessageBrokerUser {
	connection: Connection | undefined;
	channel: Channel | undefined;

	connect(url: string): Promise<Connection | undefined>;

	createChannel(): Promise<Channel | undefined>;
}

export interface IMessagePublisher {
	publish(routingKey: RoutingKey, msg: string, exchange?: ExchangeName): boolean;
	publishToQueue(queueName: string, msg: string, options: Options.Publish): boolean;
}

export interface IAssertsExchanges {
	assertExchanges(): Promise<boolean>;
}

export interface IAssertsQueues {
	setupQueues(): Promise<boolean>;
}

export interface IHasExchangeAlpha {
	exchangeAlpha: Replies.AssertExchange | undefined;
}

export interface IHasExchangeBravo {
	exchangeBravo: Replies.AssertExchange | undefined;
}

export interface IHasExchangeCharlie {
	exchangeCharlie: Replies.AssertExchange | undefined;
}

export interface IMessageBrokerUserCreatedPublisher extends IMessageBrokerUser, IHasExchangeAlpha {
}
