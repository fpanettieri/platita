'use strict';

const net = require('net');

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


const server = net.createServer((c) => {
  // 'connection' listener
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});

server.on('error', (err) => { throw err; });

// TODO: listen to this port as a parameter
server.listen(8124, () => {
  console.log('server bound');
});

// this will become a full time process that listens for specific events and reacts to it
