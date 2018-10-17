'use strict';

const node_api = require('node-binance-api');

const Logger = require('../lib/logger');
const logger = new Logger('[lib/binance]');

function init (key, secret, sandbox, verbose = false)
{
  logger.info('instantiating binance api');
  let binance = node_api().options({
    APIKEY: key,
    APISECRET: secret,
    useServerTime: true,
    test: sandbox,
    verbose: verbose
  });
  logger.info('binance api ready');

  return binance;
}

function candlesticks (binance, symbol, interval, options)
{
  return new Promise(function(resolve, reject) {
    binance.candlesticks(symbol, interval, function (error, ticks, _symbol) {
      if (error) { reject (error); }
      if (symbol !== _symbol) { reject('Symbol mismatched'); }
      resolve(ticks);
    }, options);
  });
}

function candleToObj (arr)
{
  return {
    t: arr[0],  // Open time
    o: arr[1],  // Open price
    h: arr[2],  // High price
    l: arr[3],  // Low price
    c: arr[4],  // Close price
    v: arr[5],  // Volume
    T: arr[6],  // Close time
    q: arr[7],  // Quote asset volume
    n: arr[8],  // Number of trades
    V: arr[9],  // Taker buy base asset volume
    Q: arr[10]  // Taker buy quote asset volume
  }
}

module.exports = {
  init: init,
  candlesticks: candlesticks,
  candleToObj: candleToObj
}
