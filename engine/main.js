'use strict';

const nba = require('node-binance-api');

const util = require('./util');

const binance = nba().options({
  APIKEY: process.env.BINANCE_KEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  test: process.env.BINANCE_SANDBOX
});

// Hardcoded alghoritm

// Get first 2 candles ever
// calculate difference in  openning times, that is the step
// get first opening time, that is the

const cfg = {
  symbol: "POEBTC",
  interval: "1d"
}


// Get the needed candles to calculate
binance.candlesticks(cfg.symbol, cfg.interval, (error, ticks, symbol) => {
  // console.log("candlesticks()", error, ticks, symbol);

  // if (error) { console.error(error); }

  let base = ticks[0][0];
  let step = ticks[1][0] - base;

  for (let i = 0; i < ticks.length; i++) {
    // Calculate idx
    ticks[i][12] = (ticks[i][0] - base) / step;
  }

  let d = new Date(base);

  console.log('Ticks:', ticks);

  // let last_tick = ticks[ticks.length - 1];
  // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
  // console.log(symbol + " last close: " + close);
}, {
  limit: 10,
  startTime: 0
});
