'use strict';

const assert = require('assert');
const TestSuite = require('./suite');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/bitmex]');

let symbol = process.argv[2] || 'XBTUSD';
let interval = process.argv[3] || '1d';
let port = process.argv[4] || '1234';
let host = process.argv[5] || '0.0.0.0';

async function download_metadata (socket)
{
  const ev = {e: 'DownloadMetadata', s: symbol, i: interval};
  const res = await socket.sync(ev, 'MetadataDownloaded');

  assert(res.e === 'MetadataDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
  // TODO: assert metadata count?
}

async function download_history (socket)
{
  const ev = {e: 'DownloadHistory', s: symbol, i: interval};
  const res = await socket.sync(ev, 'HistoryDownloaded');

  assert(res.e === 'HistoryDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
  // TODO: assert candle count?
}

async function download_history_range (socket)
{
  const ev = {e: 'DownloadHistory', s: symbol, i: interval, from: '2018-01-01', to: '2018-02-01'};
  const res = await socket.sync(ev, 'HistoryDownloaded');

  assert(res.e === 'HistoryDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
  // TODO: assert candle count?
}

async function download_invalid_range (socket)
{
  const ev = {e: 'DownloadHistory', s: symbol, i: interval, from: '2018-01-05', to: '2018-01-01'};
  const res = await socket.sync(ev, 'DownloadHistoryFailed');
  assert(res.e === 'DownloadHistoryFailed');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
}

const suite = new TestSuite();
suite.connect(port, host);
suite.add(download_metadata);
suite.add(download_history);
suite.add(download_history_range);
suite.add(download_invalid_range);
suite.run();
