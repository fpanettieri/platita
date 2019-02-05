'use strict';

const microservice = require('../lib/microservice');
const bitmex = require('../lib/bitmex_ws');

let ms = null;

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'WatchSymbol': {
      watchSymbol(msg.s, msg.i, socket);
    } break;
  }
}

function watchSymbol (symbol, interval, socket)
{
  try {
    ms.logger.log(symbol, interval);

    // TODO: todo

  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('watcher', 'bitmex', dispatchMsg).then(_ms => ms = _ms);
