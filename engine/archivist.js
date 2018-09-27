'use strict';

const nba = require('node-binance-api');

const cli = require('./cli');
const util = require('./util');

const binance = nba().options({
  APIKEY: process.env.BINANCE_KEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  test: process.env.BINANCE_SANDBOX
});

// Hardcoded alghoritm

// TODO: use mongo
let db = {};

const cfg = {
  symbol: "POEBTC",
  interval: "15m"
}

function getSymbolMeta (symbol, interval) {
  console.log('[]');

  binance.candlesticks(symbol, interval, (error, ticks, symbol) => {
    if (error) { throw error; }
    db[cfg.symbol].meta = {
      first: ticks[0][0],
      step: ticks[1][0] - ticks[0][0]
    };

    console.log('')

  }, {
    limit: 2,
    startTime: 0
  });
}

// -- Initialization
cli.hero();

// binance.init();



// Get all the history of the pair
// TA it
