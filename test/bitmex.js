'use strict';

const assert = require('assert');
const TestSuite = require('./test');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/bitmex]');

async function download_metadata (socket)
{
  const ev = {e: 'DownloadMetadata', s: 'XBTUSD', i: '1d'};
  const res = await socket.sync(ev, 'MetadataDownloaded');

  assert(res.e === 'MetadataDownloaded');
  assert(res.s === ev.s);
  assert(res.i === ev.i);
}

let port = process.argv[2] || '1234';
let host = process.argv[3] || '0.0.0.0';

const suite = new TestSuite();
suite.connect(port, host);
suite.add(download_metadata);
suite.add(download_metadata);
suite.add(download_metadata);
suite.add(download_metadata);

suite.run();
