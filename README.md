# trading-bot engine
Cloud of specialized microservices (Hive?)

Each service can be instanced N times. They are independent, discoverable and disposable.

* Independent: each microservice can run on it's own. It consumes input from a configured interface, and outputs specific values to another.

* Discoverable: microservices can be turned on at any moment, other services must run without needing a specific service to be up.

* Disposable: the service can crash or be stopped at any time. This must not interfere with the proper behavior of the engine.

# Services
 1. Archivist: Download trading pair history
 2. Mathematician: Calculate indicators
 3. Watcher: Fetch market data in realtime
 4. Brain: Find opportunities
 5. Analyst: Define concrete strategy
 6. Trader: Execute the strategy
 7. Accountant: Track balance and positions
 8. Scientist: Genetic evolution
 9. Overlord?: Launches new processes as needed
10. Market: Buy and sell parts and configs
11. FrontEnd: Display the hive status

## Archivist
Download the full history of a trading pair

# Usage

## Plotter  
Used to check local data
node test/plotter.js /tmp/plot.png POEBTC 15m 2018-10-25

# Dependencies
Required for running the engine

## PM2
https://www.npmjs.com/package/pm2  
Production process manager for Node.JS applications with a built-in load balancer

## Canvas  
https://www.npmjs.com/package/canvas
node-canvas is a Cairo-backed Canvas implementation for Node.js

## Bignumber.js  
https://www.npmjs.com/package/bignumber.js
A JavaScript library for arbitrary-precision decimal and non-decimal arithmetic

## MongoDB
https://docs.mongodb.com/manual/installation/#supported-platforms
MongoDB is a foss document-oriented NoSQL db. MongoDB uses JSON-like documents with schemas.

## Service Mesh docs
https://www.nginx.com/blog/microservices-reference-architecture-nginx-circuit-breaker-pattern/
https://kublr.com/blog/implementing-a-service-mesh-with-istio-to-simplify-microservices-communication/
https://istio.io/
http://philcalcado.com/2017/08/03/pattern_service_mesh.html
https://github.com/istio/istio/wiki
