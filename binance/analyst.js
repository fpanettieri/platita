'use strict';

const microservice = require('../core/microservice');
const binance = require('../lib/binance');
const utils = require('../lib/utils');

// -- Holders
let Binance = null;
let ms = null;

// -- Internal state
let period = 3;
const indicators = [];

function intervalToMs (interval)
{
  const dimension = interval[interval.length - 1];
  let ms = parseInt(interval.slice(0, -1)) * 1000;

  if (dimension === 'M') {
    ms *= 30;
  } else if (dimension === 'w') {
    ms *= 7;
  }

  switch (dimension) {
    case 'd': ms *= 24;
    case 'h': ms *= 60;
    case 'm': ms *= 60;
  }

  return ms;
}

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

    case 'AnalyzeCandle': {
      analyzeCandle(msg.s, msg.i, msg.t, msg.c, socket);
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

async function analyzeCandle (symbol, interval, timestamp, candle, socket)
{
  console.log('[analyzeCandle]', symbol, interval, timestamp, candle);
  try {
    const step = intervalToMs(interval);

    if (candle && candle.t) {
      timestamp = candle.t;
    } else if (!timestamp) {
      timestamp = Math.trunc(Date.now() / step) * step;
    }

    const to = (new Date(timestamp)).getTime();
    const from = to - step * period + 1;
    console.log(`period: ${period}, from: ${from}, to: ${to}`);

    console.log(`Binance_${symbol}_${interval}`);
    const collection = ms.db.collection(`Binance_${symbol}_${interval}`);
    const history = await collection.find({t: {$lte: from, $gte: to}}).toArray();
    console.dir(history);

    // use calculated step to
    // calculate the exact begin and end params
    // perfect fetch
    //
    // await try to fetch the latest PERIOD of candles
    // if !candle
    //   candle = last candle
    //
    // for indicator in indicators
    //   const val = indicator.fn(candle, period);
    //   if indicator.persist?
    //     persist
    // broadcast TA result

  } catch (err) {
    console.error(err);
    ms.logger.error('AnalyzeCandleFailed');
    socket.send({e: 'AnalyzeCandleFailed', s:symbol, i:interval});
  }
}

// -- Initialization
microservice.start('analyst', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
