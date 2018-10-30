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

let socket = net.createConnection(port, host);
socket.on('data', (data) => logger.log('data received', data.toString('utf8')));
socket.on('error', (err) => logger.error('socket error', err));
socket.on('close', () => logger.log('connection closed'));
socket.send = function(json) {
  json['_'] = Date.now();
  socket.write(JSON.stringify(json));
};

function runTest (test)
{
  switch (test.trim()) {
    case '0': { running = false; } break;

    // Archivist
    case '1': { socket.send({e: 'DownloadMetadata', s: symbol, i: interval}) } break;
    case '2': { socket.send({e: 'DownloadHistory', s: symbol, i: interval}) } break;
    case '3': { socket.send({e: 'DownloadHistory', s: symbol, i: interval, from: '2018-10-01'}) } break;

    // Watcher
    case '4': { socket.send({e: 'WatchSymbols', s: symbol, i: interval}) } break;

    // Analyst
    case '5': { socket.send({e: 'AddIndicator', indicator: 'SMA', period: 20}) } break;
    case '6': { socket.send({e: 'ListIndicators'}) } break;
    case '7': { socket.send({e: 'RemoveIndicator', indicator: 'SMA', period: 20}) } break;
    default: { logger.error ('Unknown test', test); }
  }

  rl.prompt();
}

// -- Init
const prompt = `
 1. DownloadMetadata ${symbol} ${interval}
 2. DownloadHistory ${symbol} ${interval}
 3. DownloadHistory ${symbol} ${interval} 2018-10-01
 4. WatchSymbols ${symbol} ${interval}
 5. AddIndicator SMA 20
 6. ListIndicators
 7. RemoveIndicator 0
 8. AnalyzeCandle ${symbol} ${interval} ....
 9. AnalyzeLastCandle ${symbol} ${interval}
> `;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: prompt
});

rl.prompt();
rl.on('line', runTest);
rl.on('close', () => { process.exit(0); });
