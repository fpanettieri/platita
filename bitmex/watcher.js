'use strict';

const microservice = require('../lib/microservice');

let ms = null;

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'WatchSymbols': {
      watchSymbols(msg.s, msg.i, socket);
    } break;
  }
}

function watchSymbols (symbols, interval, socket)
{
  try {
    const symbols_arr = symbols.split(',').map(s => s.trim());


  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('watcher', 'bitmex', dispatchMsg).then(_ms => ms = _ms);
