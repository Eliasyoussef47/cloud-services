import { Channel, Connection, Replies } from "amqplib";
import { RoutingKey } from "@/shared/MessageBroker/RoutingKey.js";
import { ExchangeName } from "@/shared/MessageBroker/constants.js";

export interface IMessageBrokerUser {
	connection: Connection | undefined;
	channel: Channel | undefined;

	connect(url: string): Promise<Connection | undefined>;

	createChannel(): Promise<Channel | undefined>;

	publish(routingKey: RoutingKey, msg: string, exchange?: ExchangeName): boolean;
}

export interface IAssertsExchanges {
	assertExchanges(): Promise<boolean>;
}

export interface IAssertsQueues extends IMessageBrokerUser {
	setupQueues(): Promise<boolean>;
}

export interface IHasExchangeAlpha extends IMessageBrokerUser, IAssertsExchanges {
	exchangeAlpha: Replies.AssertExchange | undefined;
}

export interface IHasExchangeBeta extends IMessageBrokerUser, IAssertsExchanges {
	exchangeBeta: Replies.AssertExchange | undefined;
}

export interface IHasExchangeCharlie extends IMessageBrokerUser, IAssertsExchanges {
	exchangeCharlie: Replies.AssertExchange | undefined;
}

export interface IHasExchangeDelta extends IAssertsExchanges {
	exchangeDelta: Replies.AssertExchange | undefined;
}

export interface IMessageBrokerUserCreatedPublisher extends IMessageBrokerUser, IHasExchangeAlpha {
}

export interface IMessageBrokerUserCreatedConsumer extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeDelta, IAssertsQueues {
	usersQueue: Replies.AssertQueue | undefined;
}

export interface IMessageBrokerTargetProcessed extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeCharlie, IAssertsQueues {
	usersQueue: Replies.AssertQueue | undefined;
	targetsProcessedQueue: Replies.AssertQueue | undefined;
}

export interface IMessageBrokerTargetCreated extends IMessageBrokerUser, IHasExchangeAlpha, IHasExchangeBeta, IAssertsQueues {
	usersQueue: Replies.AssertQueue | undefined;
	targetsProcessedQueue: Replies.AssertQueue | undefined;
}
