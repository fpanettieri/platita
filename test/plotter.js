'use strict';

const fs = require("fs");
const Canvas = require("canvas");

const mongo  = require('../lib/mongo');
const Logger = require('../lib/logger');

const cfg = require('../cfg/plotter.json');

async function plot (symbol, interval, from, to)
{
  const logger = new Logger(`[test/plotter]`);

  const from_t = (new Date(from)).getTime();
  const to_t = (new Date(to)).getTime();

  logger.info ('plotter starting');
  const db = await mongo.connect();
  const collection = db.collection(`Binance_${symbol}_${interval}`);
  const candles = await collection.find({t: { $gte: from_t, $lte: to_t }});

  logger.log(candles.length);

}

const symbol = process.argv[2] || 'BTCUSDT';
const interval = process.argv[3] || '1D';
const from = process.argv[4] || 0 ;
const to = process.argv[5] || Date.now();

plot (symbol, interval, from, to);

// get pair from argv
// get startDate and endDate from argv
// fetch data from mongo




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
