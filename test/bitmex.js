'use strict';

const assert = require('assert');
const TestSuite = require('./suite');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/bitmex]');

async function download_metadata (socket)
{
  const ev = {e: 'DownloadMetadata', s: 'XBTUSD', i: '1d'};
  const res = await socket.sync(ev, 'MetadataDownloaded');

  assert(res.e === 'MetadataDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);

  // TODO: assert metadata count?
}

async function download_history (socket)
{
  const ev = {e: 'DownloadHistory', s: 'XBTUSD', i: '1d'};
  const res = await socket.sync(ev, 'HistoryDownloaded');

  assert(res.e === 'HistoryDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);

  // TODO: assert candle count?
}

async function download_history_range (socket)
{
  const ev = {e: 'DownloadHistory', s: 'XBTUSD', i: '1d', from: '2018-01-01', to: '2018-02-01'};
  const res = await socket.sync(ev, 'HistoryDownloaded');

  assert(res.e === 'HistoryDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);

  // TODO: assert candle count?
}

let port = process.argv[2] || '1234';
let host = process.argv[3] || '0.0.0.0';

const suite = new TestSuite();
suite.connect(port, host);
suite.add(download_metadata);
// suite.add(download_history);
suite.add(download_history_range);
suite.run();
