'use strict';

const mongo  = require('../lib/mongo');
const socket = require('../lib/socket');
const utils   = require('../lib/utils');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/archivist]');

// Holder for Mongo Database instance
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

function dispatchMsg (msg, socket)
{
  logger.log('dispatching msg', msg);
  switch (msg[0]) {
    case "DownloadFirstCandle": {
      downloadFirstCandle(msg[1], msg[2], socket);
    } break;

    case "DownloadHistory": {
      downloadHistory(msg[1], msg[2], socket);
    } break;
  }
}

function downloadFirstCandle (symbol, interval, socket)
{
  // check if the symbol is already initialized in mongo
  // if not, download it


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

    // socket.write(`SymbolInitialized ${symbol} ${interval}`);
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
  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatchMsg);
});
