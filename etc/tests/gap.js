
  { // FIND GAP!!!!
    for (let i = 1; i < candles.length; i++) {
      console.log(candles[i].t, candles[i].t - candles[i - 1].t);
    }
  } return;
