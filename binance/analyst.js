'use strict';

const microservice = require('../microservice');
const binance = require('../lib/binance');

let Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
let { logger, db } = microservice.start('analyst', 'binance', dispatchMsg);

function dispatchMsg (msg, socket)
{
  console.log('magic');
  switch (msg[0]) {

  }
}
