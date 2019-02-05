'use strict';

const microservice = require('../lib/microservice');
const bitmex = require('../lib/bitmex');

let ms = null;

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
