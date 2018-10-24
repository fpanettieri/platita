'use strict';

const fs = require("fs");
const canvas = require("canvas");

const mongo  = require('../lib/mongo');
const Logger = require('../lib/logger');
const logger = new Logger(`[test/plotter]`);

const cfg = require('../cfg/plotter.json');

async function plot (symbol, interval, from, to)
{
  const from_t = (new Date(from)).getTime();
  const to_t = (new Date(to)).getTime();
  logger.info ('plotting', symbol, interval, from_t, to_t);

  const db = await mongo.connect();
  const collection = db.collection(`Binance_${symbol}_${interval}`);
  logger.log(`plotting Binance_${symbol}_${interval}`);

  const candles = await collection.find({t: { $gte: from_t, $lte: to_t }}).toArray();

  // -- Setup canvas
  const img_size = {
    w: cfg.gutter.horizontal + candles.length * (cfg.candles.width + cfg.candles.margin),
    h: cfg.gutter.vertical + cfg.height
  }
  const c = canvas.createCanvas(img_size.w, img_size.h);
  const g = c.getContext('2d');
  logger.log('canvas created');

  // Render bg
  g.fillStyle = cfg.bg;
  g.fillRect(0, 0, img_size.w, img_size.h);

  // TODO: Render grid
  // TODO: Render candles
  // TODO: Render render indicators
  // TODO: Render positions

  fs.writeFileSync('/tmp/test.png', c.toBuffer());
  logger.log(`chart saved as test.png`);
}

const symbol = process.argv[2] || 'BTCUSDT';
const interval = process.argv[3] || '1d';
const from = process.argv[4] || 0 ;
const to = process.argv[5] || Date.now();

plot (symbol, interval, from, to);


// const canvas = new Canvas(200, 200, "png");
// const g = canvas.getContext('2d')
//
// // Write "Awesome!"
// g.font = '30px Impact'
// g.rotate(0.1)
// g.fillText('Awesome!', 50, 100)
//
// // Draw line under text
// var text = g.measureText('Awesome!')
// g.strokeStyle = 'rgba(0,0,0,0.5)'
// g.beginPath()
// g.lineTo(50, 102)
// g.lineTo(50 + text.width, 102)
// g.stroke()
//
// const buf = canvas.toBuffer();
// fs.writeFileSync("test.png", buf);
