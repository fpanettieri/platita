'use strict';

const net = require('net');

const Logger = new require('./logger');
const logger = new Logger('[lib/socket]');

function listen (port, host, cb)
{
  logger.log('opening socket');

  const server = net.createServer((c) => handleConnections(c, cb));
  server.on('error', handleErrors);
  logger.log('tcp server ready');

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
  return '<' + data.trim() + '>';
}

function unpack (data)
{
  data = data.trim();
  if (data[0] !== '<' || data[data.length - 1] !== '>'){
    // FIXME: check if a throw is correct, or a better method is preferred
    logger.log(data);
    throw 'malformed msg: ' + data;
  }
  return data.substring(1, data.length - 1).split(' ');
}

module.exports = {
  listen: listen
}
