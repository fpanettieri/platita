'use strict';

const microservice = require('../core/microservice');
const binance = require('../lib/binance');

// -- Holders
let Binance = null;
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
    ms.logger.log('now watching', symbols_arr);

    Binance.websockets.candlesticks(symbols_arr, interval, (candlestick) => {
      const c = candlestick.k;
      const e = c.x ? 'CandleClosed' : 'CandleUpdated';
      socket.send({e: e, candle: candlestick.k});

      // Store closed candles
      if (!c.x) { return }
      const collection = ms.db.collection(`Binance_${c.s}_${c.i}`);
      collection.replaceOne({t: c.t}, c, {upsert: true});
    });

  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('watcher', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
