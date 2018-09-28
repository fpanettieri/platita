'use strict';


for (let i = 0; i < cfg.symbols.length; i++) {
  initSymbol(cfg.symbols[i], cfg.interval);
}

async function init (symbol, interval) {
  console.log(`[${symbol}:${interval}] initSymbol`);


  // TODO: Check if the data exists in mongo

  db[symbol] = {};

  binance.candlesticks(symbol, interval, parseSymbolMeta, {
    limit: 2,
    startTime: 0
  });
}

function parseSymbolMeta (error, ticks, symbol) {
  if (error) {
    console.error(`[${symbol}:${interval}] Initialization failed!`);
    throw error;
  }

  db[symbol].meta = {
    first: ticks[0][0],
    step: ticks[1][0] - ticks[0][0]
  };

  let lifetime = Date.now() - ticks[0][0];
  let candles = Math.trunc(lifetime / db[symbol].meta.step);

  console.log(`[${symbol}:${interval}] Life: ${lifetime}\tCandles: ${candles}`);
}

module.exports = {
  clone: clone
}
