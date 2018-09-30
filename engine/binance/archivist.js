'use strict';

function bind (emitter)
{
  console.log(`[Archivist.bind]`);
  // Bind event handlers
}

function getMetadata (symbol, interval, binance, db)
{
  console.log(`[Archivist.getMetadata] ${symbol}:${interval}`);

  binance.candlesticks(symbol, interval, (error, ticks, _symbol) => {
    if (error) {
      console.error(`[${symbol}:${interval}] getMetadata failed!`);
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
  bind: bind,
  getMetadata: getMetadata
}
