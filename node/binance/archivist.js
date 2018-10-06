'use strict';

const mongo  = require('../lib/mongo');
const socket = require('../lib/socket');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/archivist]');

// Holder for Mongo instance
let db = null;

function cliHero ()
{
  logger.log(`
              _    _     _    _
  __ _ _ _ __| |_ (_)_ _(_)__| |_
 / _\` | '_/ _| ' \\| \\ V / (_-<  _|
 \\__,_|_| \\__|_||_|_|\\_/|_/__/\\__|
___________________________________
  `);
}

function cliHelp ()
{
  if (process.argv[2] !== '-h') { return; }
  logger.log('\nusage: node archivist <port> <host>\n');
  process.exit();
}

function dispatchMsg (msg)
{
  logger.log('dispatching msg', msg);
  switch (msg[0]) {
    case "DownloadFirstCandle": {
      downloadFirstCandle(msg[1], msg[2]);
    } break;

    case "DownloadHistory": {
      downloadHistory(msg[1], msg[2]);
    } break;
  }
}

function downloadFirstCandle (symbol, interval)
{
  binance.candlesticks(symbol, interval, (error, ticks, _symbol) => {
    if (error) {
      backbone.emit('error', 'Symbol initialization failed: ', symbol, interval);
    }

    throw 'Persist this data in mongo';

    db[symbol].meta = {
      first: ticks[0][0],
      step: ticks[1][0] - ticks[0][0]
    };

    let lifetime = Date.now() - ticks[0][0];
    let candles = Math.trunc(lifetime / db[symbol].meta.step);

    logger.log(`[${symbol}:${interval}] Life: ${lifetime}\tCandles: ${candles}`);

    // throw 'CONTINUE HERE'
    // TODO: Read about proper event cycles, implement it here.
    // Notify other modules that the symbol has been initialized properly
    // Archivist: download the old history of the symbol
    // Watcher: watch the market in real time, store the candles in the database
    // Analyst: After each candle arrives

    // backbone.emit('SymbolInitialized', symbol, interval);
  }, {
    limit: 2,
    startTime: 0
  });
}

function downloadHistory (symbol, interval)
{

}

// -- Initialization
cliHelp();
cliHero();

mongo.connect((_db) => {
  db = _db;
  socket.listen(dispatchMsg);
});
