'use strict';

const mongo   = require('../lib/mongo');
const socket  = require('../lib/socket');
const binance = require('../lib/binance');

const Logger = require('../lib/logger');
const logger = new Logger('[binance/archivist]');

const CANDLESTICKS_LIMIT = 500;

// Instance holders
let Binance = null;
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
  switch (msg[0]) {
    case "DownloadMetadata": {
      downloadMetadata(msg[1], msg[2], socket);
    } break;

    case "DownloadFullHistory": {
      downloadHistory(msg[1], msg[2], 0, Date.now(), socket);
    } break;

    case "DownloadPartialHistory": {
      downloadHistory(msg[1], msg[2], msg[3], msg[4], socket);
    } break;
  }
}

async function downloadMetadata (symbol, interval, _socket)
{
  const id = `${symbol}_${interval}`;
  const collection = db.collection('Binance_Metadata');

  try {
    const cached = await collection.findOne({'id': id});
    if (cached) { socket.send(_socket, `MetadataDownloaded ${symbol} ${interval} ${cached.first} ${cached.step}`); return; }
    logger.info(`${id} metadata not found`);

    const options = { limit: 2, startTime: 0 };
    const ticks = await binance.candlesticks(Binance, symbol, interval, options);
    logger.info(`${id} metadata received`);

    const meta = { id: id, first: ticks[0][0], step: ticks[1][0] - ticks[0][0] };
    const result = await collection.insertOne(meta);
    logger.info(`${id} metadata stored`);

    socket.send(_socket, `MetadataDownloaded ${symbol} ${interval} ${meta.first} ${meta.step}`);
  } catch (err) {
    logger.log(err);
  }
}

async function downloadHistory (symbol, interval, from, to, _socket)
{
  try {
    const id = `${symbol}_${interval}`;
    const meta_col = db.collection('Binance_Metadata');
    const metadata = await meta_col.findOne({'id': id});
    if (!metadata) { throw `${id} metadata not found`; }

    const from_t = from ? (new Date(from)).getTime() : metadata.first;
    const to_t = to ? (new Date(to)).getTime() : Date.now();
    if (from_t > to_t) { throw `invalid time interval: from ${from} to ${to}`; }

    const collection = db.collection(`Binance_${id}`);
    const lifetime = to_t - from_t;
    const candles = Math.trunc(lifetime / metadata.step);
    const fetches = Math.ceil(candles / CANDLESTICKS_LIMIT);
    logger.log(`life: ${lifetime}\tcandles: ${candles}\t fetches: ${fetches}`);

    await collection.deleteMany({t: { $gte: from_t, $lte: to_t }});
    logger.info(`${id} removed duplicates`);

    for (let i = 0; i < fetches; i++) {
      let options = { limit: CANDLESTICKS_LIMIT, startTime: from_t + metadata.step * CANDLESTICKS_LIMIT * i };
      let ticks = await binance.candlesticks(Binance, symbol, interval, options);

      let ticks_objs = ticks.map((k) => binance.candleToObj(k));
      await collection.insertMany(ticks_objs);

      logger.info(`${id} ${i + 1}/${fetches}`);
      socket.send(_socket, `HistoryPartiallyDownloaded ${symbol} ${interval} ${i + 1} ${fetches}`);
    }

    logger.info(`${id} history updated`);
    socket.send(_socket, `HistoryDownloaded ${symbol} ${interval} ${from_t} ${to_t}`);
  } catch (err) {
    logger.log(err);
  }
}

// -- Initialization
cliHelp();
cliHero();

Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
mongo.connect((_db) => {
  db = _db;
  let port = process.argv[2] || 0;
  let host = process.argv[3] || '0.0.0.0';
  socket.listen(port, host, dispatchMsg);
});
