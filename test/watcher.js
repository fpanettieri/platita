'use strict';

const assert = require('assert');
const TestSuite = require('./suite');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/watcher]');

let symbol = process.argv[2] || 'XBTUSD';
let interval = process.argv[3] || '1m';
let port = process.argv[4] || '1234';
let host = process.argv[5] || '0.0.0.0';

async function watch_symbol (socket)
{
  const ev = {e: 'WatchSymbol', s: symbol, i: interval};
  const res = await socket.sync(ev, 'CandleClosed');

  assert(res.e === 'CandleClosed');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
  // TODO: assert candle count?
}

const suite = new TestSuite();
suite.connect(port, host);
suite.add(watch_symbol);
suite.run();
