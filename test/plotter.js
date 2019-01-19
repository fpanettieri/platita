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
  ['o','h','l','c','v'].forEach(prop => {
    candle[prop] = BigNumber(candle[prop]);
  });
}

function project (candle, idx, range, cfg)
{
  let p = {};
  let scale = cfg.height / range.value;

  ['o','h','l','c'].forEach(prop => {
    p[prop] = {
      x: Math.floor((idx + 1) * (cfg.candles.width + cfg.candles.margin)),
      y: Math.floor(cfg.height - (candle[prop] - range.min) * scale)
    }
  });

  return p;
}

async function plot (output, id, from, to)
{
  try {

  const from_t = (new Date(from)).getTime();
  const to_t = (new Date(to)).getTime();
  logger.info ('plotting', symbol, interval, from_t, to_t);

  const db = await mongo.connect();
  const collection = db.collection(id);
  logger.log(`plotting ${id}`);

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

  { // Render background
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, img_size.w, img_size.h);
    logger.log('rendered bg');
  }

  { // Render axis
    ctx.beginPath();
    ctx.strokeStyle = cfg.grid.axis;
    ctx.moveTo(0, chart_size.h);
    ctx.lineTo(chart_size.w, chart_size.h);
    ctx.lineTo(chart_size.w, 0);
    ctx.stroke();
    ctx.closePath();
    logger.log('rendered axis');
  }

  { // Render grid
    ctx.beginPath();
    ctx.strokeStyle = cfg.grid.color;
    ctx.setLineDash(cfg.grid.dash);
    for (let i = 1; i < candles.length; i += cfg.grid.step) {
      const x = (cfg.candles.width + cfg.candles.margin) * i;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chart_size.h);
      ctx.stroke();
    }
    for (let i = 1; i < cfg.grid.intervals; i++) {
      const gap = Math.floor(chart_size.h / cfg.grid.intervals);
      ctx.moveTo(0, gap * i);
      ctx.lineTo(chart_size.w, gap * i);
      ctx.stroke();
    }
    ctx.closePath();
    logger.log('rendered grid');
  }

  { // Render candles
    let range = {min: Number.MAX_VALUE, max: Number.MIN_VALUE };
    for (let i = 0; i < candles.length; i++) {
      let candle = candles[i];
      if (candle.l.lt(range.min)) { range.min = candle.l; }
      if (candle.h.gt(range.max)) { range.max = candle.h; }
    }
    range.value = range.max - range.min;
    logger.log(`trading range ${range.min} / ${range.max} (${range.value})`);

    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      const style = candle.c >= candle.o ? cfg.candles.white : cfg.candles.black;

      // project
      const proj = project(candle, i, range, cfg);

      // wick
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.strokeStyle = style.wick;
      ctx.moveTo(proj.l.x, proj.l.y);
      ctx.lineTo(proj.h.x, proj.h.y);
      ctx.stroke();
      ctx.closePath();

      // body
      const top = candle.o > candle.c ? proj.o : proj.c;
      const half_w = cfg.candles.width / 2;
      const height = Math.abs(proj.c.y - proj.o.y);
      ctx.fillStyle = style.body;
      ctx.strokeStyle = style.border;
      ctx.rect(top.x - half_w, top.y, cfg.candles.width, height);
      ctx.stroke();
      ctx.fill();
    }
  }

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
const id = process.argv[3] || 'bitmex_xbtusd_1d';
const from = process.argv[5] || 0 ;
const to = process.argv[6] || Date.now();

plot (output, symbol, interval, from, to);
