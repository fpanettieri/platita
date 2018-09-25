'use strict';

const nba = require('node-binance-api');

const binance = nba().options({
  APIKEY: process.env.BINANCE_KEY,
  APISECRET: process.env.BINANCE_SECRET,
  useServerTime: true,
  test: process.env.BINANCE_SANDBOX
});

// Hardcoded alghoritm
