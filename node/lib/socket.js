'use strict';

const net = require('net');

const Logger = new require('./logger').Logger;
const logger = new Logger('[lib/socket]');

function listen (cb)
{
  logger.log('opening socket');

  const server = net.createServer((c) => handleConnections(c, cb));
  server.on('error', handleErrors);
  logger.log('tcp server ready');

  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  logger.log('binding server to', host, port);

  server.listen(port, host, () => {
    let addr = server.address();
    logger.log('listening on', addr.address, addr.port);
  });
}

function handleConnections (client, cb)
{
  logger.log('client connected');
  client.setEncoding('utf-8');

  client.on('data', function (data) {
    logger.log('data received');
    const msg = unpack(data);
    cb(msg);
  });

  client.on('end', function () { logger.log('client disconnected'); });
}

function handleErrors (err)
{
  if (err.code === 'EADDRINUSE') {
    logger.log('Another server is already listening on the requested port!');
  }
  throw err;
}

function pack (data)
{
  return '<' + data + '>';
}

function unpack (data)
{
  if (data[0] !== '<' || data[data.length - 1] !== '>'){
    // FIXME: check if a throw is correct, or a better metod is preferred
    throw 'malformed msg: ' + data;
  }
  return data.substring(1, data.length - 1).split(' ');
}

module.exports = {
  connect: connect
}
