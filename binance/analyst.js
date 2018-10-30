'use strict';

const microservice = require('../core/microservice');
const indicators = require('../core/indicators');
const binance = require('../lib/binance');

// -- Holders
let Binance = null;
let ms = null;

const indicators = [];

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'AddIndicator': {
      addIndicator(msg, socket);
    } break;

    case 'ListIndicators': {
      listIndicators(socket);
    } break;

    case 'RemoveIndicator': {
      removeIndicator(msg[1], socket);
    } break;
  }
}

function addIndicator (msg, socket)
{
  for (let i = 0; i < indicators.length; i++) {
    const ind = indicators[i];
    if (ind.indicator == msg.indicator && ind.cfg == msg.cfg) {
      console.log('repeated!', ind);
    } else {
      console.log('unique!', ind);
    }
  }
  indicators.push({indicator: msg.indicator, cfg: msg.cfg});
  
  //indicators.push({indicator: msg.indicator, cfg: msg.cfg, fn: require(`../indicators/${msg.indicator}`)});
}

// -- Initialization
microservice.start('analyst', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
