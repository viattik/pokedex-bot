const Pokedex = require('pokedex-promise-v2');

const TEXTS = require('./constants/texts');
const BUTTONS = require('./constants/buttons');

const pokedex = new Pokedex();

const LIMIT = 20;

function getInterval(pageNumber) {
  return { offset: pageNumber * LIMIT + 1, limit: LIMIT - 1 };
}

module.exports.intents = {
  '/pokemons': (pageNumber = 0) => {
    // those + 1 and - 1 are related to pokedex-promise bug
    return pokedex.getPokemonsList(getInterval(pageNumber))
      .then(({ results }) => {
        return {
          reply: TEXTS.POKEMON_LIST(pageNumber, results),
          form: {
            reply_markup: {
              keyboard: [
                pageNumber === 0
                  ? [ BUTTONS.MAIN_MENU, BUTTONS.NEXT_PAGE ]
                  : [ BUTTONS.MAIN_MENU, BUTTONS.PREV_PAGE, BUTTONS.NEXT_PAGE ],
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }
        };
      });
  },
  '/pokemon': (name) => {
    return pokedex.getPokemonByName(name)
      .then((response) => {
        return [
          { replyMethod: 'sendPhoto', reply: response.sprites.front_default },
          { reply: TEXTS.POKEMON(response) }
        ];
      });
  },
  '/types': () => {
    return pokedex.getTypesList()
      .then(({ results }) => {
        return {
          reply: TEXTS.TYPES_LIST(results),
        }
      });
  },
  '/type': (name, showPokemons) => {
    return pokedex.getTypeByName(name)
      .then((response) => {
        return [
          { reply: showPokemons ? TEXTS.TYPE_POKEMONS(response) : TEXTS.TYPE(response) }
        ];
      });
  },
};

module.exports.aliases = {
  [BUTTONS.POKEMON_LIST]: '/pokemons',
  [BUTTONS.TYPES_LIST]: '/types',
};

module.exports.getDefaultReply = () => {
  return {
    reply: TEXTS.DEFAULT,
    form: {
      reply_markup: {
        keyboard: [
          [ BUTTONS.POKEMON_LIST, BUTTONS.TYPES_LIST ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  };
};
