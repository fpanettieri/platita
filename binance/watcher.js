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
    ms.logger.info(`watching ${id}`);

    const raw_col = ms.db.collection(`${id}_raw`);
    const ohlc_col = ms.db.collection(`${id}_ohlc`);

    Binance.websockets.candlesticks(symbol, interval, (candlestick) => {
      const raw = candlestick.k;
      const ohlc = (o) => binance.toOhlc(raw);
      const ev = raw.x ? 'CandleClosed' : 'CandleUpdated';

      ms.logger.log(`${id} ${ev}`);
      socket.send({e: ev, s: symbol, i: interval, raw: raw, ohlc: ohlc});

      // Store closed candles
      if (!raw.x) { return }

      ms.logger.log(`raw ${raw}`);
      ms.logger.log(`ohlc ${ohlc}`);

      raw_col.replaceOne({t: raw.t}, raw, {upsert: true});
      ohlc_col.replaceOne({t: ohlc.t}, ohlc, {upsert: true});
    });

  } catch (err) {
    ms.logger.error('WatchSymbolFailed');
    socket.send({e: 'WatchSymbolFailed', s: symbol, i: interval});
  }
}

// -- Initialization
microservice.start('watcher', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
