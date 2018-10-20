'use strict';

const microservice = require('../microservice');
const binance = require('../lib/binance');

// -- Holders
let Binance = null;
let ms = null;

function dispatchMsg (msg, socket)
{
  switch (msg[0]) {
    case "AddIndicator": {
      // downloadMetadata(msg[1], msg[2], socket);
    } break;

    case "ListIndicators": {
      // downloadMetadata(msg[1], msg[2], socket);
    } break;

    case "RemoveIndicator": {
      // downloadMetadata(msg[1], msg[2], socket);
    } break;
  }
}

// -- Initialization
microservice.start('analyst', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
