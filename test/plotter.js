'use strict';

const fs = require('fs');
const canvas = require('canvas');
const BigNumber = require('bignumber.js');

const mongo  = require('../lib/mongo');
const utils  = require('../lib/utils');

const Logger = require('../lib/logger');
const logger = new Logger(`[test/plotter]`);

const cfg = require('../cfg/plotter.json');

function parseBignums (candle)
{
  ['o','h','l','v','q','V','Q','B'].forEach(prop => {
    candle[prop] = BigNumber(candle[prop]);
  });
}

async function plot (output, symbol, interval, from, to)
{
  try {

  const from_t = (new Date(from)).getTime();
  const to_t = (new Date(to)).getTime();
  logger.info ('plotting', symbol, interval, from_t, to_t);

  const db = await mongo.connect();
  const collection = db.collection(`Binance_${symbol}_${interval}`);
  logger.log(`plotting Binance_${symbol}_${interval}`);

  const candles = await collection.find({t: { $gte: from_t, $lte: to_t }}).toArray();
  candles.forEach(parseBignums);

  // -- Setup canvas
  const chart_size = {
    w: candles.length * (cfg.candles.width + cfg.candles.margin),
    h: cfg.height
  };
  const img_size = {
    w: cfg.gutter.horizontal + chart_size.w,
    h: cfg.gutter.vertical + chart_size.h
  }
  const c = canvas.createCanvas(img_size.w, img_size.h);
  const ctx = c.getContext('2d');
  logger.log('canvas created');

  // Render background
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(0, 0, img_size.w, img_size.h);
  logger.log('rendered bg');

  // Render axis
  ctx.beginPath();
  ctx.strokeStyle = cfg.grid.axis;
  ctx.moveTo(0, chart_size.h);
  ctx.lineTo(chart_size.w, chart_size.h);
  ctx.lineTo(chart_size.w, 0);
  ctx.stroke();
  ctx.closePath();
  logger.log('rendered axis');

  // Render vertical guides
  ctx.beginPath();
  ctx.strokeStyle = cfg.grid.color;
  ctx.setLineDash(cfg.grid.dash);
  for (let i = 1; i < candles.length; i += cfg.grid.step) {
    let x = (cfg.candles.width + cfg.candles.margin) * i;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, chart_size.h);
    ctx.stroke();
  }
  ctx.closePath();
  logger.log('rendered vertical grid');

  // Find range
  let range = {min: Number.MAX_VALUE, max: Number.MIN_VALUE };
  logger.log('finding range');

  for (let i = 0; i < candles.length; i++) {
    let candle = candles[i];
    if (candle.l.lt(range.min)) { range.min = candle.l; }
    if (candle.h.gt(range.max)) { range.max = candle.h; }
  }

  // Render horizontal guides


  // Render candles

  // TODO: Render render indicators
  // TODO: Render positions

  fs.writeFileSync(output, c.toBuffer());
  logger.log(`chart saved as ${output}`);

} catch (err) {
  logger.error(err);
} finally {
  process.exit();
}
}

const output = process.argv[2] || '/tmp/plot.png'
const symbol = process.argv[3] || 'BTCUSDT';
const interval = process.argv[4] || '1d';
const from = process.argv[5] || 0 ;
const to = process.argv[6] || Date.now();

plot (output, symbol, interval, from, to);
