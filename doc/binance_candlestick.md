# Problem
Binance has 2 similar formats for candlesticks.

REST                                WebSocket
------------------------------      -------------------------------
// Open time                        // Kline start time
// Open                             // Open price
// High                             // High price
// Low                              // Low price
// Close                            // Close price
// Volume                           // Base asset volume
// Close time                       // Kline close time
// Quote asset volume               // Quote asset volume
// Number of trades                 // Number of trades
// Taker buy base asset volume      // Taker buy base asset volume
// Taker buy quote asset volume     // Taker buy quote asset volume
// Ignore                           // Ignore

WebSocket only
-----------------------
// Symbol
// Interval
// First trade ID
// Last trade ID
// Is this kline closed?

# Our approach
Data is propagated using the REST structure
{
  t: arr[0],  // Open time
  o: arr[1],  // Open price
  h: arr[2],  // High price
  l: arr[3],  // Low price
  c: arr[4],  // Close price
  v: arr[5],  // Volume
  T: arr[6],  // Close time
  q: arr[7],  // Quote asset volume
  n: arr[8],  // Number of trades
  V: arr[9],  // Taker buy base asset volume
  Q: arr[10]  // Taker buy quote asset volume
}
