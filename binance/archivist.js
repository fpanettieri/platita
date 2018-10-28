'use strict';

const microservice = require('../core/microservice');
const binance = require('../lib/binance');

const CANDLESTICKS_LIMIT = 500;

// -- Holders
let Binance = null;
let ms = null;

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

async function downloadMetadata (symbol, interval, socket)
{
  const id = `${symbol}_${interval}`;
  const collection = ms.db.collection('Binance_Metadata');

  try {
    const cached = await collection.findOne({'id': id});
    if (cached) { socket.write(`<MetadataDownloaded ${symbol} ${interval} ${cached.first} ${cached.step}>`); return; }
    ms.logger.info(`${id} metadata not found`);

    const options = { limit: 2, startTime: 0 };
    const ticks = await binance.candlesticks(Binance, symbol, interval, options);
    ms.logger.info(`${id} metadata received`);

    const meta = { id: id, first: ticks[0][0], step: ticks[1][0] - ticks[0][0] };
    const result = await collection.insertOne(meta);
    ms.logger.info(`${id} metadata stored`);

    socket.write(`<MetadataDownloaded ${symbol} ${interval} ${meta.first} ${meta.step}>`);
  } catch (err) {
    ms.logger.error(`DownloadMetadata failed`);
    socket.write(`<DownloadMetadataFailed ${symbol} ${interval}>`);
  }
}

async function downloadHistory (symbol, interval, from, to, socket)
{
  try {
    const id = `${symbol}_${interval}`;
    const meta_col = ms.db.collection('Binance_Metadata');
    const metadata = await meta_col.findOne({'id': id});
    if (!metadata) { throw `${id} metadata not found`; }

    const from_t = from ? (new Date(from)).getTime() : metadata.first;
    const to_t = to ? (new Date(to)).getTime() : Date.now();
    if (from_t > to_t) { throw `invalid time interval: from ${from} to ${to}`; }

    const collection = ms.db.collection(`Binance_${id}`);
    const lifetime = to_t - from_t;
    const candles = Math.trunc(lifetime / metadata.step);
    const fetches = Math.ceil(candles / CANDLESTICKS_LIMIT);
    ms.logger.log(`life: ${lifetime}\tcandles: ${candles}\t fetches: ${fetches}`);

    await collection.deleteMany({t: { $gte: from_t, $lte: to_t }});
    ms.logger.info(`${id} removed duplicates`);

    for (let i = 0; i < fetches; i++) {
      let options = { limit: CANDLESTICKS_LIMIT, startTime: from_t + metadata.step * CANDLESTICKS_LIMIT * i };
      let ticks = await binance.candlesticks(Binance, symbol, interval, options);

      let ticks_objs = ticks.map((k) => binance.candleToObj(k));
      await collection.insertMany(ticks_objs);
      socket.write(`<HistoryPartiallyDownloaded ${symbol} ${interval} ${i + 1} ${fetches}>`);
    }

    ms.logger.info(`${id} history updated`);
    socket.write(`<HistoryDownloaded ${symbol} ${interval} ${from_t} ${to_t}>`);
  } catch (err) {
    ms.logger.log(err);
  }
}

// -- Initialization
microservice.start('archivist', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
