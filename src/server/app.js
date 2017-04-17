const Config = require("./config");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const log = require("winston");

class App {

  /**
   * Construct new App
   *
   * @param {Board} board
   *   An initialized Board object
   * @param {RedisClient} redis
   *   An existing RedisClient object
   */
  constructor(board, redis) {
    this.board = board;
    this.redis = redis;

    this.connectedUsers = 0;
  }

  /**
   * Begins running the server
   *
   * Assumes that the board has already been initialized
   */
  run() {
    server.listen(Config.listenPort);
    app.use(express.static(Config.staticDir));
    log.info("app started");

    this.registerRoutes();
    this.registerSockets();
  }

  /**
   * Register route callbacks
   */
  registerRoutes() {

    app.get("/", (req, res) => {
      log.info("someone connected", {ip: req.ip});
      res.sendFile(Config.staticDir + "/index.html");
    });

    app.get("/bitmap", (req, res) => {
      log.info("someone fetching bitmap", {ip: req.ip});
      this.board.getBoard()
        .then((data) => {
          res.write(data, "binary", () => {
            res.end(null, "binary");
          });
        })
        .catch((err) => this.respondWith500Error(res, err));
    });
  }

  /**
   * Register websocket callbacks
   */
  registerSockets() {
    io.on("connection", (socket) => {
      this.connectedUsers++;
      socket.emit("metadata", this.wsOkay(this.getClientMetadata(socket)));
      socket.broadcast.emit("newuser", this.wsOkay(this.connectedUsers));
      socket.on("placement", (block) => this.handleNewBlock(socket, block));
      socket.on("disconnect", () => this.connectedUsers-- );
    });
  }

  /**
   * Prepares metadata to send to the client upon intial connection
   *
   * @param {object} socket
   *   Socket.io socket
   * @param {object} incoming
   *   The incoming block sent by the client
   */
  getClientMetadata(socket) {
    return {
      connected_users: this.connectedUsers,
    };
  }

  /**
   * Stores a new block and broadcasts it the rest of the clients
   *
   * @param {object} socket
   *   Socket.io socket
   * @param {object} incoming
   *   The incoming block sent by the client
   */
  handleNewBlock(socket, incoming) {
    if (!this.isValidBlockObject(incoming)) {
      socket.emit("placement:error",
          this.wsError("invalid block received", {block: incoming}));
      log.error("got bad block, but caught it", incoming);
      return;
    }
    this.board.setBlock(...incoming)
      .then((_) => {
        socket.broadcast.emit("incoming", this.wsOkay(incoming));
      }, (err) => {
        socket.emit("placement:error", this.wsError(err));
      })
  }

  /**
   * Checks if an incoming websocket block is a valid
   *
   * @param {array} data
   *   The data as received from the socket
   */
  isValidBlockObject(data) {
    return (Array.isArray(data)
            && data.length === 3
            && this.board.isValidBlock(...data));
  }

  /**
   * Respond with server error
   *
   * @param {ServerResponse} res
   *   The http server response object
   * @param {string} error
   *   The error message
   */
   respondWith500Error(res, error) {
      log.error("Sending 500:", error);
      res.status(500).send(error);
   }

  /**
   * Helper to wrap websocket Okay response
   *
   * @param {object} data
   *   The data to send
   */
   wsOkay(data) {
     return {ok: true, data: data};
   }

  /**
   * Helper to wrap websocket Error response
   *
   * @param {object} errMsg
   *   The error message to send
   */
   wsError(errMsg, details=false) {
     let resp = {ok: false, error: errMsg};
     if (details) {
       resp.details = details;
     }
     return resp;
   }
}

module.exports = App;
