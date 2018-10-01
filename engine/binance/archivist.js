'use strict';

const net = require('net');

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
  console.log('usage: node archivist <port> <host>\n');
  process.exit();
}

function handleConnections (conn)
{
  console.log('client connected');
}

function handleErrors (err)
{
  if (err.code === 'EADDRINUSE') {
    console.log('Another server is already listening on the requested port!');
  }
  throw err;
}

function bind (backbone)
{
  backbone.emit('ArchivistBind');

  backbone.on('SymbolInitialized', downloadHistory);
  backbone.on('SymbolInitialized', downloadHistory);

  backbone.emit('ArchivistBound');
}

// binance, db, backbone, how do I pass these params

function getMetadata (symbol, interval)
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
cliHero();
cliHelp();

const server = net.createServer(handleConnections);
server.on('error', handleErrors);

let port = process.argv[2] || 0;
let host = process.argv[3] || '0.0.0.0';

server.listen(port, host, () => {
  let addr = server.address();
  console.log(`~> listening on ${addr.address}:${addr.port}`);
});
