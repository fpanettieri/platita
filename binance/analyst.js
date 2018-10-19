'use strict';

const microservice = require('../microservice');
const binance = require('../lib/binance');

let ms = null;

function dispatchMsg (msg, socket)
{
  ms.logger.log('magic');
  switch (msg[0]) {

  }
}

microservice.start('analyst', 'binance', dispatchMsg).then(_ms => ms = _ms);
let Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
