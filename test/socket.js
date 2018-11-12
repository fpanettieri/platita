'use strict';

const assert   = require('assert');
const net      = require('net');
const readline = require('readline');

const Logger = new require('../lib/logger');
const logger = new Logger('[test/socket]');

// -- Socket config
assert(process.argv.length > 2);
let port = process.argv[2];
let host = process.argv[3] || '0.0.0.0';
let symbol = process.argv[4] || 'BTCUSDT';
let interval = process.argv[5] || '15m';

let socket = null;

function connect () {
  socket = net.createConnection(port, host);
  socket.send = (json) => {
    json['_'] = Date.now();
    socket.write(JSON.stringify(json));
  };

  socket.on('error', (err) => logger.error('connection lost, retrying in 5 secs'));
  socket.on('close', () => setTimeout(connect, 5000));
}

function runTest (test)
{
  switch (test.trim()) {
    case '0': { running = false; } break;

    // Archivist
    case '1':  { socket.send({e: 'DownloadMetadata', s: symbol, i: interval}) } break;
    case '2':  { socket.send({e: 'DownloadHistory', s: symbol, i: interval}) } break;
    case '3':  { socket.send({e: 'DownloadHistory', s: symbol, i: interval, from: '2018-10-01'}) } break;

    // Watcher
    case '4':  { socket.send({e: 'WatchSymbols', s: symbol, i: interval}) } break;

    // Analyst
    case '5':  { socket.send({e: 'AddIndicator', indicator: 'sma', cfg: {period: 20, name: 'sma_20', persist: true}}) } break;
    case '6':  { socket.send({e: 'ListIndicators'}) } break;
    case '7':  { socket.send({e: 'RemoveIndicator', indicator: 'sma', cfg: {period: 20, name: 'sma_20', persist: true}}) } break;
    case '8':  { socket.send({e: 'AnalyzeCandle', s: symbol, i: interval}) } break;
    case '9':  { socket.send({e: 'AnalyzeCandle', s: symbol, i: interval, t: "2017-08-18"}) } break;
    case '10': { socket.send({e: 'AnalyzeCandle', s: symbol, i: interval, c: {o: 4330.29000000, h: 4330.29000000, l: 4318.39000000, c: 4330.00000000, v: 0.06536400, t: 1502949600000.0}}) } break;

    default: { logger.error ('Unknown test', test); }
  }

  rl.prompt();
}

// -- Init
const prompt = `
 1.  DownloadMetadata ${symbol} ${interval}
 2.  DownloadHistory ${symbol} ${interval}
 3.  DownloadHistory ${symbol} ${interval} 2018-10-01
 4.  WatchSymbols ${symbol} ${interval}
 5.  AddIndicator sma 20
 6.  ListIndicators
 7.  RemoveIndicator sma 20
 8.  AnalyzeCandle ${symbol} ${interval} (last)
 9.  AnalyzeCandle ${symbol} ${interval} 2018-10-01
 10  AnalyzeCandle ${symbol} ${interval} {candle}
> `;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: prompt
});

connect();
rl.prompt();
rl.on('line', runTest);
rl.on('close', () => { process.exit(0); });
