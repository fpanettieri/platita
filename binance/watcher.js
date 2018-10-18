'use strict';

const mongo   = require('../lib/mongo');
const socket  = require('../lib/socket');
const binance = require('../lib/binance');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/watcher]');

// Instance holders
let Binance = null;
let db = null;

function cliHero ()
{
  logger.log(`
              _      _
 __ __ ____ _| |_ __| |_  ___ _ _
 \\ V  V / _\` |  _/ _| ' \\/ -_) '_|
  \\_/\\_/\\__,_|\\__\\__|_||_\\___|_|
___________________________________
  `);
}

function cliHelp ()
{
  if (process.argv[2] !== '-h') { return; }
  logger.log('\nusage: node watcher <port> <host>\n');
  process.exit();
}

function dispatchMsg (msg, socket)
{
  switch (msg[0]) {
    case "WatchSymbols": {
      watchSymbols(msg[1], msg[2], socket);
    } break;
  }
}

function watchSymbols (symbols, interval, _socket)
{
  try {
    const symbols_arr = symbols.split(',').map(s => s.trim());
    logger.log('now watching', symbols_arr);

    Binance.websockets.candlesticks(symbols_arr, interval, (candlestick) => {
      const c = candlestick.k;
      const e = c.x ? 'CandlestickClosed' : 'CandlestickUpdated';
      socket.send(_socket, `${e} ${c.s} ${c.i} ${c.t} ${c.o} ${c.h} ${c.l} ${c.c} ${c.v} ${c.T} ${c.q} ${c.n} ${c.V} ${c.Q}`);

      // Store closed candles
      if (!c.x) { return }
      const collection = db.collection(`Binance_${c.s}_${c.i}`);
      collection.updateOne({t: c.t}, c, {upsert: true});
    });

  } catch (err) {
    logger.log(err);
  }
}

// -- Initialization
cliHelp();
cliHero();

Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
mongo.connect((_db) => {
  db = _db;
  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatchMsg);
});
