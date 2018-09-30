'use strict';

function init (symbols, interval, binance, db)
{
  for (let i = 0; i < symbols.length; i++) {
    initSymbol(symbols[i], interval, mutex, binance, mongo);
  }

  // TODO: once every symbol has been initialized, trigger the watch event
}

function initSymbol (symbol, interval, binance, mongo)
{
  console.log(`[${symbol}:${interval}] initSymbol`);

  // TODO: Check if the data exists in mongo

  binance.candlesticks(symbol, interval, (error, ticks, _symbol) => {
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
  }, {
    limit: 2,
    startTime: 0
  });
}

module.exports = {
  init: init,
  initSymbol
}
