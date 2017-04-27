# /r/place inspired real-time pixel placer

Requires redis for storing board data

## Installation

    npm install
    npm run-script build

## Configuration

- Be sure that redis is running
- Run `nodejs utils/create-board <boardName> <numRows>` to create a new empty board in redis under the key `board:boardName`. The board will be `numRows`blocks wide and tall.
- Modify `src/server/config.js` and put your newly created board name, the port you want to run websockets/http on, and any redis config options you need.
- Modify `src/client/main.js` to specify the websockets port and how many pixels wide/tall you want a single block to display as.

## Finally

- Run`npm start`
- Load it in a browser
- Click somewhere

