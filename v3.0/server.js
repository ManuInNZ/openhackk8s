const express = require("express"),
    app = express(),
    promClient = require("prom-client"),
    server = require("http").createServer(app),
    exec = require("child_process").exec,
    rcon = require("rcon");

let port = process.env.PORT || 8080;

var currentPopulationGauge = new promClient.Gauge({
    name: "minecraft_population",
    help: "Population of the server."
});

var playerGauge = new promClient.Gauge({
    name: 'minecraft_users',
    help: 'Number of users on the server'
});

var maxPlayerGauge = new promClient.Gauge({
    name: 'minecraft_users_max',
    help: 'Max number of users on the server'
});

function getPlayerMetrics() {

    var conn = new rcon("localhost", 25575, "cheesesteakjimmys", {
        tcp: true,
        challenge: false
    });

    conn.on('auth', function() {
        console.log("Authed!");
        this.send("list");

    }).on('response', function(str) {
        console.log("Got response: " + str);

        var result = str.split(" ");

        var currentPlayers = parseInt(result[2]);
        var currentMaxPlayers = parseInt(result[6]);

        console.log("Current: " + currentPlayers);
        console.log("Max: " + currentMaxPlayers);

        playerGauge.set(currentPlayers);

        maxPlayerGauge.set(currentMaxPlayers);


    }).on('end', function() {
        console.log("Socket closed!");
        process.exit();

    });

    conn.connect();


}

function getPopulation() {
    population = exec('ls /metrics/world/playerdata | wc -l', (error, stdout, stderr) => {
            console.log(`Population ${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }

            var population = parseInt(stdout);

            currentPopulationGauge
                .set(population);
        }
    );
}


app.get("/", function (req, res) {
    hellosProvided.inc();
    res.send("Hello World!");
});

app.get("/metrics", (req, res) => {
    getPlayerMetrics();
    getPopulation();

    res.set("Content-Type", promClient.register.contentType);
    res.end(promClient.register.metrics());
});

server.listen(port);
console.log("location server listening on port: " + port);

module.exports = server;
