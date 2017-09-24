'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs');
const Bot = require('slackbots');
const Wit = require('node-wit').Wit;
const Pokedex = require('pokedex-promise-v2');
const { SLACKBOT_NAME, SLACKBOT_TOKEN, WIT_TOKEN } = require('./../env.json');

const TEXTS = require('./constants/texts');

// create a bot
const slackSettings = {
  token: SLACKBOT_TOKEN,
  name: SLACKBOT_NAME
};

const slack = new Bot(slackSettings);
const wit = new Wit({ accessToken: WIT_TOKEN });
const pokedex = new Pokedex();

let conversations = {};

function pushConversation(slackMessage, witMessage) {
  const id = slackMessage.user;
  if (!conversations[id]) { conversations[id] = []; }
  conversations[id].push({ slack: slackMessage, wit: witMessage });
}

function logIntents(message, data) {
  const user = getUser(message);
  console.log('-----------');
  console.log(`Got a message "${message.text}" from user ${user.name}.`);
  console.log(`Wit recognized the next intents: ${Object.keys(data.entities).join(', ')}`);
}

function isChatMessage(message) {
  return message.type === 'message' && Boolean(message.text);
}
function isChannelConversation(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
}
function isMentioningPokedex(message) {
  return isChatMessage(message) && message.text.includes(`<@${slack.user.id}>`)
}
function isMessageFromPokedex(message) {
  return message.user === slack.user.id;
}
function getUser(message) {
  return slack.users.find((item) => item.id === message.user);
}
function getMessagesWithIntents(message, intentName) {
  return (conversations[message.user] || []).filter((item) => {
    return item.wit.entities[intentName];
  });
}
function getLastMessage(message) {
  const messages = conversations[message.user];
  return messages && messages.length > 0 ? messages[messages.length - 1] : null;
}
function removeMentions(text) {
  return text.replace(/(<@.{9}>)/, '');
}

// Slack replies
function postReply(message, text) {
  slack.postMessage(message.channel,text, { as_user: true });
}

slack.on('start', () => {
  slack.user = slack.users.find((user) => {
    return user.name === slackSettings.name;
  });
});

function processIntent(message, data) {
  const intents = data.entities;
  logIntents(message, data);
  if (intents.greetings) {
    const user = getUser(message);
    const greetingMessages = getMessagesWithIntents(message, 'greetings');
    const text = !greetingMessages.length
      ? TEXTS.FIRST_GREETING(user)
      : TEXTS.RANDOM_GREETING(user);
    postReply(message, text);
    return true;
  }

  if (intents.know_about && intents.pokemons) {
    postReply(message, TEXTS.POKEMONS_INFO);
    return true;
  }

  if (intents.type && intents.type_name && (intents.know_about || intents.question)) {
    const typeName = intents.type_name[0].value.toLowerCase();
    pokedex.getTypeByName(typeName)
      .then((response) => {
        postReply(message, TEXTS.TYPE(response));
      }).catch((error) => {
        if (error.statusCode === 404) {
          postReply(message, TEXTS.TYPE_NOT_FOUND);
        }
      });
    return true;
  }

  if (intents.contact && intents.weight && (intents.know_about || intents.question)) {
    const pokemonName = intents.contact[0].value.toLowerCase();
    pokedex.getPokemonByName(pokemonName)
      .then((response) => {
        postReply(message, TEXTS.POKEMON_WEIGHT(response));
      })
      .catch((error) => {
        if (error.statusCode === 404) {
          postReply(message, TEXTS.POKEMON_NOT_FOUND);
        }
      });
    return true;
  }

  if (intents.contact && intents.word_number && (intents.know_about || intents.question)) {
    const pokemonName = intents.contact[0].value.toLowerCase();
    pokedex.getPokemonByName(pokemonName)
      .then((response) => {
        postReply(message, TEXTS.POKEMON_NUMBER(response));
      })
      .catch((error) => {
        if (error.statusCode === 404) {
          postReply(message, TEXTS.POKEMON_NOT_FOUND);
        }
      });
    return true;
  }

  if (intents.know_about && intents.contact && intents.contact.length === 1) {
    const pokemonName = intents.contact[0].value.toLowerCase();
    pokedex.getPokemonByName(pokemonName)
      .then((response) => {
        postReply(message, TEXTS.POKEMON(response));
      })
      .catch((error) => {
        if (error.statusCode === 404) {
          postReply(message, TEXTS.POKEMON_NOT_FOUND);
        }
      });
    return true;
  }

  if (intents.thanks) {
    postReply(message, TEXTS.YOURE_WELCOME);
    return true;
  }

  if (intents.answer) {
    const lastMessage = getLastMessage(message);
    if (lastMessage && lastMessage.wit.entities.thanks) {
      const answer = intents.answer[0].value;
      const text = answer.toLowerCase() === 'yes' ? TEXTS.OK_HIT_ME : TEXTS.ALRIGHT;
      postReply(message, text);
      return true;
    }
  }
}

slack.on('message', (message) => {
  if (isChatMessage(message) && !isMessageFromPokedex(message)
    && (
      !isChannelConversation(message)
        || isChannelConversation(message) && isMentioningPokedex(message)
    )
  ) {
    const text = removeMentions(message.text);
    wit.message(text).then((data) => {
      const processed = processIntent(message, data);
      if (!processed) {
        postReply(message, TEXTS.DIDNT_UNDERSTAND);
      }
      pushConversation(message, data);
    })
  }
});
