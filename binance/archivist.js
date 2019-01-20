'use strict';

const mongodb = require('mongodb');

const microservice = require('../lib/microservice');
const binance = require('../lib/binance');

const CANDLESTICKS_LIMIT = 500;

// -- Holders
let Binance = null;
let ms = null;

function dispatchMsg (msg, socket)
{
  switch (msg.e) {
    case 'DownloadMetadata': {
      downloadMetadata(msg.s, msg.i, socket);
    } break;

    case 'DownloadHistory': {
      downloadHistory(msg.s, msg.i, msg.from || 0, msg.to || Date.now(), socket);
    } break;
  }
}

async function downloadMetadata (symbol, interval, socket)
{
  const id = `binance_${symbol}_${interval}`.toLowerCase();
  const collection = ms.db.collection('metadata');

  try {
    const cached = await collection.findOne({'id': id});
    if (cached) { socket.send({e: 'MetadataDownloaded', s: symbol, i: interval, first: cached.first, step: cached.step}); return; }
    ms.logger.info(`${id} metadata not found`);

    const options = { limit: 2, startTime: 0 };
    const ticks = await binance.candlesticks(Binance, symbol, interval, options);
    ms.logger.info(`${id} metadata received`);

    const meta = { id: id, first: mongodb.Long.fromNumber(ticks[0][0]), step: ticks[1][0] - ticks[0][0] };
    const result = await collection.insertOne(meta);
    ms.logger.info(`${id} metadata stored`);

    socket.send({e: 'MetadataDownloaded', s:symbol, i:interval, first: meta.first, step: meta.step});
  } catch (err) {
    ms.logger.error('DownloadMetadataFailed', err);
    socket.send({e: 'DownloadMetadataFailed', s:symbol, i:interval});
  }
}

async function downloadHistory (symbol, interval, from, to, socket)
{
  try {
    const id = `binance_${symbol}_${interval}`.toLowerCase();
    const meta_col = ms.db.collection('metadata');
    const metadata = await meta_col.findOne({'id': id});
    if (!metadata) { throw `${id} metadata not found`; }

    const from_t = from ? (new Date(from)).getTime() : metadata.first;
    const to_t = to ? (new Date(to)).getTime() : Date.now();
    if (from_t > to_t) { throw `invalid time interval: from ${from} to ${to}`; }

    const raw_col = ms.db.collection(`binance_${id}_raw`);
    const ohlc_col = ms.db.collection(`binance_${id}_ohlc`);

    const lifetime = to_t - from_t;
    const candles = Math.trunc(lifetime / metadata.step);
    const fetches = Math.ceil(candles / CANDLESTICKS_LIMIT);
    ms.logger.log(`life: ${lifetime}\tcandles: ${candles}\t fetches: ${fetches}`);

    await raw_col.deleteMany({t: { $gte: from_t, $lte: to_t }});
    await ohlc_col.deleteMany({t: { $gte: from_t, $lte: to_t }});
    ms.logger.info(`${id} removed duplicates`);

    for (let i = 0; i < fetches; i++) {
      const options = { limit: CANDLESTICKS_LIMIT, startTime: from_t + metadata.step * CANDLESTICKS_LIMIT * i };
      const ticks = await binance.candlesticks(Binance, symbol, interval, options);
      const ticks_objs = ticks.map((k) => binance.toObj(k));
      await collection.insertMany(ticks_objs);

      const ohlcs = ticks.map((k) => binance.toOhlc(k));
      await ohlc_col.insertMany(ohlcs);

      socket.send({e: 'HistoryPartiallyDownloaded', s: symbol, i: interval, progress: (i + 1) / fetches});
    }

    ms.logger.info(`${id} history updated`);
    socket.send({e: 'HistoryDownloaded', s: symbol, i: interval, from: from_t, to: to_t});
  } catch (err) {
    ms.logger.error('DownloadHistoryFailed', err);
    socket.send({e: 'DownloadHistoryFailed', s: symbol, i: interval, from: from, to: to});
  }
}

// -- Initialization
microservice.start('archivist', 'binance', dispatchMsg).then(_ms => ms = _ms);
Binance = binance.init(process.env.BINANCE_KEY, process.env.BINANCE_SECRET, process.env.BINANCE_SANDBOX);
