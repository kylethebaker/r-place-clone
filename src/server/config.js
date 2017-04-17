const path = require("path");

module.exports = {
  staticDir: path.join(__dirname, "../../public"),
  listenPort: 8080,
  boardName: "board:board2",
  redisOptions: {
    return_buffers: true,
  },
  logLevel: "debug",
};
