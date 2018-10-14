'use strict';

const mongo       = require('../lib/mongo');
const socket      = require('../lib/socket');
const utils       = require('../lib/utils');
const binance_api = require('./api');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/archivist]');

// Instance holders
let binance = null;
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
    case "DownloadMetadata": {
      downloadMetadata(msg[1], msg[2], socket);
    } break;

    case "DownloadHistory": {
      downloadHistory(msg[1], msg[2], socket);
    } break;
  }
}

function downloadMetadata (symbol, interval, _socket)
{
  const id = `${symbol}_${interval}`;
  const collection = db.collection('Binance_Metadata');

  collection.findOne({'id': id})
  .then(meta => {
    if (meta) { return meta }

    binance.candlesticks(symbol, interval, (error, ticks, _symbol) => {
      if (error) { throw error; }

      return collection.insertOne({id: {
        first: ticks[0][0],
        step: ticks[1][0] - ticks[0][0]
      }});

    }, { limit: 2, startTime: 0 });
  })
  .then(meta => socket.send(_socket, `MetadataDownloaded ${symbol} ${interval} ${meta.first} ${meta.step}`))
  .catch(err => logger.error(err));
}

function downloadHistory (symbol, interval)
{

}

// -- Initialization
cliHelp();
cliHero();

binance = binance_api.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
mongo.connect((_db) => {
  db = _db;
  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatchMsg);
});
