'use strict';

// const mongodb = require('mongodb');

const cli = require('./lib/cli');

// const util = require('./lib/util');

const binance_api = require('./binance/api');
const archivist = require('./binance/archivist');

// config
const env = process.env;
const argv = process.argv;
const cfg = { symbols: ["BTCUSDT"], interval: "15m" };

// -- Go!
process.title = 'bearish_bottoms';
cli.hero();

if (argv.length == 3 && argv[2] === '-h') {
  return cli.help();
} else if (argv.length == 4) {
  cfg.symbols = argv[2].split(',');
  cfg.interval = argv[3];
}

const binance = binance_api.init(env.BINANCE_KEY, env.BINANCE_SECRET, env.BINANCE_SANDBOX);

archivist.init(cfg.symbols, cfg.interval, binance, mongo);

console.log('[DONE]');
