'use strict';

const nba = require('node-binance-api');

const binance = nba().options({
  APIKEY: process.env.BINANCE_KEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  test: process.env.BINANCE_SANDBOX
});

// Hardcoded alghoritm


// Get the needed candles to calculate
binance.candlesticks("POEBTC", "1D", (error, ticks, symbol) => {
  console.log("candlesticks()", ticks);
  // let last_tick = ticks[ticks.length - 1];
  // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
  console.log(symbol + " last close: " + close);
}, {limit: 20});


console.log('done');
