/**
 * Command line utility to initialize a new redis bitfield
 */
const redis = require("redis").createClient();

var [boardName, numCols, ..._] = process.argv.slice(2);

if (!boardName) {
  console.log("No board name provided. Usage is `nodesjs create-board.js <boardName> <numCols>`");
  process.exit();
}

boardName = "board:" + boardName;
numCols = numCols ? parseInt(numCols) : 100;

ensureDoesntExist()
  .then(createNewBoard, boardAlreadyExistsError)
  .then(finished, boardNotCreatedError)

function ensureDoesntExist() {
  return new Promise((okay, alreadyExists) => {
    redis.exists(boardName, (err, res) => {
      (res == 0) ? okay() : alreadyExists();
    })
  });
}

function createNewBoard() {
  return new Promise((created, notCreated) => {
    let bytesNeeded = Math.pow(numCols, 2) / 2;
    let buffer = new Buffer.alloc(bytesNeeded, 255);
    redis.set(boardName, buffer, (err, res) => {
      err === null ? created() : notCreated(err);
    });
  });
}

function finished() {
  console.log("SUCCESS:", boardName, "was created with", numCols, "rows and columns.");
  process.exit();
}

function boardAlreadyExistsError() {
  console.log("ERROR:", boardName, "already exists");
  process.exit()
}

function boardNotCreatedError(err) {
  console.log("ERROR:", boardName, "not created");
  console.log(err);
  process.exit()
}
