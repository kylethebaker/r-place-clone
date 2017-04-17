const LocalTable = require("../shared/localTable");
const http = require("http");

class BotHelper {

  constructor(socketClient, tableBitfield) {
    this.client = socketClient;
    this.table = tableBitfield;
    this.courtesyDelay = 5000;
    this.protection = new Map([]);

    setInterval(doSomething, courtesyDelay);
  }

  static getTable(url) {
    http.get(url), (res) => {
      if (res.statusCode !== 200) {
        console.log("Error fetching data: ", res.statusCode);
        return false;
      }

      var data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      }).on("end", () => {
        return new LocalTable(Uint8Array(Buffer.concat(data)));
      });
    }
  }

  protect(points, color) {
    // allow for either array of points or single point
    if (!Array.isArray(points[0])) {
      points = [points];
    }
    points.forEach((point) => {
      this.protection.set(point, color);
    });
  }

  registerProtection() {
    this.client.on("incoming", (incoming) => {
      if (!incoming.ok) {
        return false;
      }
      var point = incoming.data;
      if (this.protection.has(point)) {
        const color = this.protection.get(point);
        const [x, y] = point;
        this.addMove([x, y, color]);
        this.client.emit("placement", [x, y, color]);
      }
    });
  }

  addMove(move) {
    this.moveQueue.push(move);
  }

  doSomething() {
   
  }

}

module.exports = BaseBot;
