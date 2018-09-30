'use strict';

const events = require('events');

const cli = require('./lib/cli');

const binance_api = require('./binance/api');
const archivist = require('./binance/archivist');

// config
const env = process.env;
const argv = process.argv;
const cfg = { symbols: ["BTCUSDT"], interval: "15m" };
const db = {};

// -- Go!
process.title = 'bearish_bottoms';
cli.hero();

if (argv.length == 3 && argv[2] === '-h') {
  return cli.help();
} else if (argv.length == 4) {
  cfg.symbols = argv[2].split(',');
  cfg.interval = argv[3];
}

const emitter = new events();
const binance = binance_api.init(env.BINANCE_KEY, env.BINANCE_SECRET, env.BINANCE_SANDBOX);

archivist.bind(emitter);
// watcher.bind()

for (let i = 0; i < symbols.length; i++) {
  let symbol = symbols[i];
  db[symbol] = {};
  archivist.init(symbol, cfg.interval, binance, db);
}

console.log('[DONE]');
