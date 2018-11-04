'use strict';

const microservice = require('../core/microservice');
const binance = require('../lib/binance');

// -- Holders
let Binance = null;
let ms = null;

// -- Internal state
let period = 1;
const indicators = [];

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'AddIndicator': {
      addIndicator(msg.indicator, msg.cfg, socket);
    } break;

    case 'ListIndicators': {
      listIndicators(socket);
    } break;

    case 'RemoveIndicator': {
      removeIndicator(msg.indicator, msg.cfg, socket);
    } break;
  }
}

function indexOf (indicator, cfg)
{
  const cfg_str = JSON.stringify(cfg);
  for (let i = 0; i < indicators.length; i++) {
    const ind = indicators[i];
    if (ind.indicator === indicator && JSON.stringify(ind.cfg) === cfg_str) { return i; }
  }
  return -1;
}

function addIndicator (indicator, cfg, socket)
{
  let e = 'DuplicatedIndicator';
  let idx = indexOf(indicator, cfg);
  if (idx == -1) {
    e = 'IndicatorAdded';
    indicators.push({indicator: indicator, cfg: cfg, fn: require(`../indicators/${indicator}`)});
  }
  if (cfg.period && cfg.period > period) { period = cfg.period; }

  socket.send({e: e, indicator: indicator, cfg: cfg});
}

function listIndicators (socket)
{
  socket.send({e: 'ListedIndicators', indicators: indicators});
}

function removeIndicator (indicator, cfg, socket)
{
  let e = 'IndicatorNotFound';
  let idx = indexOf(indicator, cfg);
  if (idx > -1) {
    e = 'IndicatorRemoved';
    indicators.splice(idx, 1);
  }
  socket.send({e: e, indicator: indicator, cfg: cfg});
}

function analyzeCandle ()
{
  // check if the candle param is sent
  // find the last timestamp
  // fetch the last PERIOD candles
  // reorder them
  // for each indicator
  //   analyze the candles
  //   if indicator.persist?
  //     persist
  // broadcast TA result
}

// -- Initialization
microservice.start('analyst', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
