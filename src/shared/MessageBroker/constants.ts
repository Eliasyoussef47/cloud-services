import { Channel } from "amqplib";

export const exchangeAlphaName = "alpha";

export type AssertExchangeParams = Parameters<Channel["assertExchange"]>

export const exchangeAlphaParams: AssertExchangeParams = [exchangeAlphaName, "topic", { durable: true }];
