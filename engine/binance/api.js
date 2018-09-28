'use strict';

const nba = require('node-binance-api');

function init (key, secret, sandbox, verbose)
{
  let binance = nba().options({
    APIKEY: key,
    APISECRET: secret,
    useServerTime: true,
    test: sandbox,
    verbose: verbose
  });

  console.log('sync?', binance);
  return binance;
}

module.exports = {
  init: init
}
