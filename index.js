const { LineBot } = require('bottender');
const { createServer } = require('bottender/express');
const { createStore } = require('redux');
const reducer = require('./reducer');
const { LineClient } = require('messaging-api-line');

const store = createStore(reducer);
const exec = require('./event');

const { accessToken, channelSecret, PORT: port = 5000 } = process.env;

const bot = new LineBot({
  accessToken,
  channelSecret,
});


const client = LineClient.connect(accessToken, channelSecret);

bot.onEvent(async (context) => {
  if (context.event.isText) {
    await exec(context, store, client);
  }
});

const server = createServer(bot);

server.listen(port, () => {
  console.log(`server is running on ${port} port...`);
});
