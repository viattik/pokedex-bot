'use strict';
const express = require('express');
const TBot = require('node-telegram-bot-api');
const _ = require('lodash/fp');

const BUTTONS = require('./constants/buttons');
const { intents, aliases, getDefaultReply } = require('./intents');
const searchPokemons = require('./pokemon-search');
const { TELEGRAM_TOKEN } = require('./../env.json');

const app = express();
const telegram = new TBot(TELEGRAM_TOKEN, { polling: true });
let lastMessages = {};

const FORM_DEFAULTS = {
  parse_mode: 'Markdown',
  reply_markup: {
    keyboard: [
      [ BUTTONS.MAIN_MENU ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	res.send('Nothing is here');
	res.end();
});

function getReply(id, text) {
  const parts = text.split('_');
  let command = parts[0];
  let params = parts.slice(1);
  const lastMessage = lastMessages[id];
  const currentPage = lastMessage && lastMessage.params[0] ? lastMessage.params[0] : 0;

  // Processing pages
  switch (command) {
    case BUTTONS.PREV_PAGE:
      if (!lastMessage) { break; }
      command = lastMessage.command;
      params = [ currentPage >= 1 ? currentPage - 1 : 0 ];
      break;
    case BUTTONS.NEXT_PAGE:
      if (!lastMessage) { break; }
      command = lastMessage.command;
      params = [ Number(currentPage) + 1 ];
      break;
  }

  if (aliases[command]) { command = aliases[command]; }
  const intent = intents[command];
  if (!intent) {
    console.log('No reply defined, sending default - greetings...');
    return Promise.resolve(getDefaultReply());
  }
  lastMessages[id] = { command, params };
  console.log('Sending reply...');
  return Promise.resolve(intent(...params));
}

function sendReply(id, { reply = '', replyMethod = 'sendMessage', form = {} }) {
  const params = Object.assign({}, FORM_DEFAULTS, form );
  return telegram[replyMethod](id, reply, params);
}

function onMessage(message) {
  const { text, from } = message;
  console.log('-----------');
  console.log(`Got a message "${text}" from ${from.first_name} ${from.last_name}`);
  getReply(message.chat.id, text).then((replies) => {
    if (!replies) { replies = [ getDefaultReply() ]; }
    if (!_.isArray(replies)) { replies = [ replies ]; }
    replies
      .reduce((prevPromise, reply) =>
          prevPromise.then(() => sendReply(message.chat.id, reply)),
        Promise.resolve()
      );
  });
}

function onInlineQuery(query) {
  const searchTerm = query.query.trim();
  if (searchTerm.length < 3) { return; }
  searchPokemons(searchTerm)
    .then((items) => {
      const result = items.slice(0, 10).map((item) => {
        return {
          type: 'article',
          id: item.name,
          title: item.name,
          input_message_content: {
            message_text: `/pokemon_${item.name}`
          }
        }
      });
      telegram.answerInlineQuery(query.id, result);
    });
}

telegram.on('text', onMessage);
telegram.on('edited_message', onMessage);
telegram.on('inline_query', onInlineQuery);

app.listen(app.get('port'), function () {
	console.log('Pokedex app is running on port', app.get('port'));
});
