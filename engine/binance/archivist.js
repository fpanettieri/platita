'use strict';

const crypto = require('crypto');
const net = require('net');
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

function cliHero ()
{
  console.log(`
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
  console.log('\nusage: node archivist <port> <host>\n');
  process.exit();
}

function pack (data)
{
  return '<' + data + '>';
}

function unpack (data)
{
  if (data[0] !== '<' || data[data.length - 1] !== '>'){
    throw 'malformed msg: ' + data;
  }
  return data.substring(1, data.length - 1).split(' ');
}

function handleConnections (client)
{
  console.log('~> client connected');
  client.setEncoding('utf-8');

  client.on('data', function (data) {
    const msg = unpack(data);

    switch (msg[0]) {
      case "DownloadFirstCandle": {
        downloadFirstCandle(msg[1], msg[2]);
      } break;

      case "DownloadHistory": {
        downloadHistory(msg[1], msg[2]);
      } break;
    }
  });

  client.on('end', function () {
    console.log('~> client disconnected');
  });
}

function handleErrors (err)
{
  if (err.code === 'EADDRINUSE') {
    console.log('Another server is already listening on the requested port!');
  }
  throw err;
}

function downloadFirstCandle (symbol, interval)
{
  binance.candlesticks(symbol, interval, (error, ticks, _symbol) => {
    if (error) {
      backbone.emit('error', 'Symbol initialization failed: ', symbol, interval);
    }

    db[symbol].meta = {
      first: ticks[0][0],
      step: ticks[1][0] - ticks[0][0]
    };

    let lifetime = Date.now() - ticks[0][0];
    let candles = Math.trunc(lifetime / db[symbol].meta.step);

    console.log(`[${symbol}:${interval}] Life: ${lifetime}\tCandles: ${candles}`);

    // throw 'CONTINUE HERE'
    // TODO: Read about proper event cycles, implement it here.
    // Notify other modules that the symbol has been initialized properly
    // Archivist: download the old history of the symbol
    // Watcher: watch the market in real time, store the candles in the database
    // Analyst: After each candle arrives

    backbone.emit('SymbolInitialized', symbol, interval);
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

// MongoClient.connect(`${config.bd}://${config.server}:${config.port}`,{ useNewUrlParser: true }).then(onConnect).catch(utils.error);

const server = net.createServer(handleConnections);
server.on('error', handleErrors);

let port = process.argv[2] || 0;
let host = process.argv[3] || '0.0.0.0';

server.listen(port, host, () => {
  let addr = server.address();
  console.log(`~> listening on ${addr.address}:${addr.port}`);
});
