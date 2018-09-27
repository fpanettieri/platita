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

// Hardcoded strategy

// TODO: use mongo
let db = {};

const cfg = {
  symbols: ["POEBTC", "AIONBTC"],
  interval: "15m"
}

function getSymbolMeta (symbol, interval) {
  console.log(`[getSymbolMeta] ${symbol}, ${interval}`);

  db[symbol] = {};

  binance.candlesticks(symbol, interval, (error, ticks, symbol) => {
    if (error) { throw error; }

    db[symbol].meta = {
      first: ticks[0][0],
      step: ticks[1][0] - ticks[0][0]
    };

    let lifetime = Date.now() - ticks[0][0];
    let candles = Math.trunc(lifetime / db[symbol].meta.step);

    console.log(`[${symbol}] Life: ${lifetime}\tCandles: ${candles}`);
  }, {
    limit: 2,
    startTime: 0
  });
}

// -- Initialization
cli.hero();

for (let i = 0; i < cfg.symbols.length; i++) {
  getSymbolMeta(cfg.symbols[i], cfg.interval);
}

// let api = binance.init();



// Get all the history of the pair
// TA it
