'use strict';

const fs = require("fs");
const Canvas = require("canvas");

const canvas = new Canvas(200, 200, "png");
const g = canvas.getContext('2d')

// Write "Awesome!"
g.font = '30px Impact'
g.rotate(0.1)
g.fillText('Awesome!', 50, 100)

// Draw line under text
var text = g.measureText('Awesome!')
g.strokeStyle = 'rgba(0,0,0,0.5)'
g.beginPath()
g.lineTo(50, 102)
g.lineTo(50 + text.width, 102)
g.stroke()

const buf = canvas.toBuffer();
fs.writeFileSync("test.png", buf);
