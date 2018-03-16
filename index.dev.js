const { ConsoleBot } = require('bottender');
const exec = require('./event');
const { createStore } = require('redux');
const reducer = require('./reducer');

const store = createStore(reducer);
const bot = new ConsoleBot();

bot.onEvent(async (context) => {
  if (context.event.isText) {
    await exec(context, store);
  }
});

bot.createRuntime();
