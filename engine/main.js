'use strict';

// const mongodb = require('mongodb');

const cli = require('./lib/cli');
const sync = require('./lib/sync');
// const util = require('./lib/util');

const binance_api = require('./binance/api');
// const archivist = require('./binance/archivist');

const env = process.env;
const argv = process.argv;
const cfg = { symbols: ["BTCUSDT"], interval: "15m" };

debugger;

// TODO: parse from cfg file, and merge with command line param. (cli > cfg > default)

// -- Go!
cli.title();
cli.hero();

if (process.argv.length == 3 && process.argv[2] === '-h') {
  return cli.help();
}

binance = binance_api.init(env.BINANCE_KEY, env.BINANCE_SECRET, env.BINANCE_SANDBOX, env.BINANCE_VERBOSE);

// Ensure every symbol has been initialized
const mutex = sync.mutex();
archivist.init(cfg.symbols, cfg.interval, mutex, binance, mongo);
sync.wait(mutex);

console.log('[DONE]');
