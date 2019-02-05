'use strict';

const microservice = require('../lib/microservice');
const binance = require('../lib/binance');

let Binance = null;
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
    const id = `binance_${symbol}_${interval}`.toLowerCase();

    const raw_col = ms.db.collection(`${id}_raw`);
    const ohlc_col = ms.db.collection(`${id}_ohlc`);

    ms.logger.info(`watching ${id}`);

    Binance.websockets.candlesticks(symbol, interval, (candlestick) => {
      const c = candlestick.k;
      const e = c.x ? 'CandleClosed' : 'CandleUpdated';
      socket.send({e: e, candle: candlestick.k});

      // Store closed candles
      if (!c.x) { return }
      raw_col.replaceOne({t: c.t}, c, {upsert: true});

      const ohlc = (o) => binance.toOhlc(c);
      ohlc_col.replaceOne({t: ohlc.t}, ohlc, {upsert: true});
    });

  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('watcher', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
