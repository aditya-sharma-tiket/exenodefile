var bonjour_service = require("bonjour-service");
var express = require("express");
const cors = require("cors");
var app = express();
const port = 8080;
var instance = new bonjour_service["default"]();
// var hostile = require('hostile')
// hostile.set('127.0.0.1', 'local.tiket.com', function (err) {
//   if (err) {
//     console.error(err)
//   } else {
//     console.log('set /etc/hosts successfully!')
//   }
// })
app.use(cors());
const set = new Set();
instance
  .publish({
    name: "Test Server for network discovery",
    type: "tms",
    protocol: "tcp",
    port: port,
    txt: { endpoints: ["/", "/getActiveServices", "/checkConnection"] },
  })
  .on("up", () => {
    console.log("service started");
  });

function getServices() {
  console.log("started discovering");
  try {
    const Browser = instance
      .find({ type: "tms", protocol: "tcp" })
      .on("up", (service) => {
        set.add(service);
        console.log('service found:',service);
      })
      .on("down", (service) => {
        set.delete(service);
        console.log('service removed:',service);
      });
  } catch (error) {
    console.log("Encounterd error : " + error);
  }
}

app.get("/getActiveServices", function (req, res) {
  getServices();
  res.send({ activeServices: Array.from(set) });
});

app.get("/", (req, res) => {
  res.send({ val: "Hello Tiket FE team!" });
});

app.get("/status", (req, res) => {
  res.send({ val: "Connected to local server" });
});

app.get("/checkConnection", (req, res) => {
  res.send({ val: "established connection" });
});

app.listen(port, () => {
  console.log(`Started the local host on port ${port}`);
});

getServices();
