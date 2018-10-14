'use strict';

const net = require('net');

const Logger = new require('./logger');
const logger = new Logger('[lib/socket]');

function listen (port, host, cb)
{
  logger.info('opening socket');

  const server = net.createServer((c) => handleConnections(c, cb));
  server.on('error', handleErrors);
  logger.info('tcp server ready');

  logger.info('binding server to', host, port);
  server.listen(port, host, () => {
    let addr = server.address();
    logger.info('listening on', addr.address, addr.port);
  });
}

function handleConnections (client, cb)
{
  logger.log('client connected');
  client.setEncoding('utf-8');

  client.on('data', function (data) {
    data = data.trim();
    logger.log('data received', data);
    const msg = unpack(data);
    cb(msg, client);
  });

  client.on('end', function () { logger.info('client disconnected'); });
}

function handleErrors (err)
{
  if (err.code === 'EADDRINUSE') {
    logger.error('Another server is already listening on the requested port!');
  }
  throw err;
}

function pack (data)
{
  return '<' + data.trim() + '>';
}

function unpack (data)
{
  let msg = '';
  data = data.trim();
  if (data[0] !== '<' || data[data.length - 1] !== '>'){
    logger.error('malformed data', data);
  } else {
    msg = data.substring(1, data.length - 1).split(' ');
  }
  return msg;
}

module.exports = {
  listen: listen
}
