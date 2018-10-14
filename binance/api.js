'use strict';

const node_api = require('node-binance-api');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/api]');

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

module.exports = {
  init: init
}
