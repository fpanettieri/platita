'use strict';

const assert = require('assert');
const test = require('./test');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/bitmex]');

function download_metadata (socket)
{
  const ev = {e: 'DownloadMetadata', s: 'XBTUSD', i: '1d'};
  socket.send(ev);

  const res = await socket.once('MetadataDownloaded');
  assert(res.e === 'MetadataDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
}

const suite = test.suite();

suite.add(download_metadata);
suite.add(download_metadata);
suite.add(download_metadata);
suite.add(download_metadata);

suite.run();
