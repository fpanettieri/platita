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

  // FIXME: is this a good idea, or should we provide a more functional approach?
  client.send = function(json) {
    json['_'] = Date.now();
    client.write(JSON.stringify(json));
  };

  client.on('data', function (data) {
    data = data.trim();
    const msg = JSON.parse(data.trim());
    cb(msg, client);
  });

  client.on('end', function () { logger.info('client disconnected'); });
  client.on('error', function(err) { logger.error('client error', err); });
}

function handleErrors (err)
{
  if (err.code === 'EADDRINUSE') {
    logger.error('Another server is already listening on the requested port!');
  }
  throw err;
}

module.exports = {
  listen: listen
}
