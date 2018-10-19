'use strict';

const microservice = require('../microservice');
const binance = require('../lib/binance');

// -- Holders
let Binance = null;
let ms = null;

function dispatchMsg (msg, socket)
{
  switch (msg[0]) {
    case "WatchSymbols": {
      watchSymbols(msg[1], msg[2], socket);
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
      const e = c.x ? 'CandlestickClosed' : 'CandlestickUpdated';
      socket.write(`<${e} ${c.s} ${c.i} ${c.t} ${c.o} ${c.h} ${c.l} ${c.c} ${c.v} ${c.T} ${c.q} ${c.n} ${c.V} ${c.Q}>`);

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
