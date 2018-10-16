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
      if (symbol !== _symbol) { reject('Ivalid symbol'); }
      resolve(ticks);
    }, options);
  });
}

module.exports = {
  init: init,
  candlesticks: candlesticks
}
