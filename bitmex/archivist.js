'use strict';

const mongodb = require('mongodb');

const microservice = require('../lib/microservice');
const bitmex = require('../lib/bitmex');

const CANDLESTICKS_LIMIT = 500;

// -- Holders
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
  const id = `bitmex_${symbol}_${interval}`.toLowerCase();
  const collection = ms.db.collection('metadata');

  try {
    const cached = await collection.findOne({'id': id});
    if (cached) { socket.send({e: 'MetadataDownloaded', s: symbol, i: interval, first: cached.first, step: cached.step}); return; }
    ms.logger.info(`${id} metadata not found`);

    const options = { method: 'GET', api: 'trade/bucketed', testnet: false };
    const params = { symbol: symbol, binSize: interval, count: 2, startTime: 0, partial: false };
    const ticks = await bitmex.api(options, params);
    ms.logger.info(`${id} metadata received`);

    const from = (new Date(ticks[0].timestamp)).getTime();
    const to = (new Date(ticks[1].timestamp)).getTime();

    const meta = { id: id, first: mongodb.Long.fromNumber(from), step: to - from };
    const result = await collection.insertOne(meta);
    ms.logger.info(`${id} metadata stored`);

    socket.send({e: 'MetadataDownloaded', s:symbol, i:interval, first: meta.first, step: meta.step});
  } catch (err) {
    ms.logger.error('DownloadMetadataFailed');
    socket.send({e: 'DownloadMetadataFailed', s:symbol, i:interval});
  }
}

async function downloadHistory (symbol, interval, from, to, socket)
{
  try {
    const id = `bitmex_${symbol}_${interval}`.toLowerCase();
    const meta_col = ms.db.collection('metadata');
    const metadata = await meta_col.findOne({'id': id});
    if (!metadata) { throw `${id} metadata not found`; }

    const from_t = from ? (new Date(from)).getTime() : metadata.first;
    const to_t = to ? (new Date(to)).getTime() : Date.now();
    if (from_t > to_t) { throw `invalid time interval: from ${from} to ${to}`; }

    const raw_col = ms.db.collection(`${id}_raw`);
    const ohlc_col = ms.db.collection(`${id}_ohlc`);

    const lifetime = to_t - from_t;
    const candles = Math.trunc(lifetime / metadata.step);
    const fetches = Math.ceil(candles / CANDLESTICKS_LIMIT);
    ms.logger.log(`life: ${lifetime}\tcandles: ${candles}\t fetches: ${fetches}`);

    await raw_col.deleteMany({timestamp: { $gte: new Date(from_t), $lte: new Date(to_t) }});
    await ohlc_col.deleteMany({t: { $gte: from_t, $lte: to_t }});
    ms.logger.info(`${id} removed duplicates`);

    for (let i = 0; i < fetches; i++) {
      const start = new Date(from_t + metadata.step * CANDLESTICKS_LIMIT * i);
      const options = { method: 'GET', api: 'trade/bucketed', testnet: false };
      const params = { symbol: symbol, binSize: interval, count: CANDLESTICKS_LIMIT, startTime: start.toISOString(), partial: false };
      const ticks = await bitmex.api(options, params);
      await raw_col.insertMany(ticks);

      const ohlcs = ticks.map((k) => bitmex.toOhlc(k));
      await ohlc_col.insertMany(ohlcs);

      socket.send({e: 'HistoryPartiallyDownloaded', s: symbol, i: interval, progress: (i + 1) / fetches});
    }

    ms.logger.info(`${id} history updated`);
    socket.send({e: 'HistoryDownloaded', s: symbol, i: interval, from: from, to: to});
  } catch (err) {
    ms.logger.error('DownloadHistoryFailed');
    socket.send({e: 'DownloadHistoryFailed', s: symbol, i: interval, from: from, to: to});
  }
}

// -- Initialization
microservice.start('archivist', 'bitmex', dispatchMsg).then(_ms => ms = _ms);
