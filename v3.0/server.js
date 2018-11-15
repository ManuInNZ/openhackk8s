const express = require("express"),
  app = express(),
  promClient = require("prom-client"),
  server = require("http").createServer(app),
  exec = require("child_process").exec;

require('node-rcon');

let port = process.env.PORT || 3030;

var currentPlayers =  0;
var currentMaxPlayers = 0;
var currentPopulation = new promClient.Counter({
    name: "minecraft_population",
    help: "Population of the server."
  });

const playerGauge = new promClient.Gauge({ name: 'metric_name', help: 'metric_help' });
// TODO add labels for distinct values for current and max

function getPlayerMetrics() {
  var result = new Array();
  var conn = new rcon("localhost", 25575, "cheesesteakjimmys");
  conn
    .on("auth", function() {
      console.log("Authed!");
    })
    .on("response", function(str) {
      console.log("Got response: " + str);
      result = str.split(" ");
      currentPlayers = result[2];
      currentMaxPlayers = result[6];
      console.log("Current: " + currentPlayers);

      /// playerGauge.set(currentPlayers); with the right label 

    })
    .on("end", function() {
      console.log("Socket closed!");
      process.exit();
    });
  conn.connect();
  conn.send("list");
}

function getPopulation(params) {
    population = exec('ls -l /metrics/world/playerdata | wc -l',  (error, stdout, stderr) => {
        console.log(`Population ${stdout}`);
        console.log(`${stderr}`);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
        currentPopulation.set(stdout);
  }
);
}


const hellosProvided = new promClient.Counter({
  name: "hellos_provided",
  help: "Number of Hello World! strings provided."
});
app.get("/", function(req, res) {
  hellosProvided.inc();
  res.send("Hello World!");
});
app.get("/metrics", (req, res) => {
    getPlayerMetrics();


  res.set("Content-Type", promClient.register.contentType);
  res.end(promClient.register.metrics());
});
server.listen(port);
console.log("location server listening on port: " + port);
promClient.collectDefaultMetrics();
module.exports = server;
