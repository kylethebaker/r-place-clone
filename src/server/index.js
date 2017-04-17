const App = require("./app");
const Board = require("./board");
const Config = require("./config");
const Redis = require("redis");
const log = require("winston");

log.level = Config.logLevel;

const redis = Redis.createClient(Config.redisOptions);
const board = new Board(Config.boardName, redis);
const app = new App(board, redis);

board.init()
  .catch((err) => log.error("Error initing board:", err))
  .then(() => app.run())
  .catch((err) => log.error("Error running app:", err))
