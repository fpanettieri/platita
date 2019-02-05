'use strict';

const ws = require('ws');
const mongodb = require('mongodb');

const microservice = require('../lib/microservice');
const bitmex = require('../lib/bitmex');

const DMS_INTERVAL = 15 * 1000;
const DMS_TIMEOUT = 60 * 1000;

let ms = null;
const client = new ws('wss://testnet.bitmex.com/realtime');

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'WatchSymbols': {
      watchSymbols(msg.s, msg.i, socket);
    } break;
  }
}

function watchSymbols (symbol, interval, socket)
{
  try {
    ms.logger.log(symbol, interval);

  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('watcher', 'bitmex', dispatchMsg).then(_ms => ms = _ms);
