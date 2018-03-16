const { combineReducers } = require('redux');

const counter = (state = 0, { type }) => {
  switch (type) {
    case 'inc':
      return state + 1;
    case 'dec':
      return state - 1;
    default:
      return state;
  }
};

const echo = (state = false, { type }) => {
  switch (type) {
    case 'set_echo':
      return !state;
    default:
      return state;
  }
};

module.exports = combineReducers({ counter, echo });
