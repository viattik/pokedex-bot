const upperCaseFirst = require('upper-case-first');
const _ = require('lodash');

module.exports = {
  POKEMON: (item) => `*${upperCaseFirst(item.name)}*
Number in pokedex: ${item.id}
Weight: ${item.weight}
Base experience: ${item.base_experience}
He is of the next types:
${item.types.map((t) => `  - ${t.type.name}`).join('\n')}
And the next abilities:
${item.abilities.map((a) => `  - ${a.ability.name}`).join('\n')}
${item.is_default ? 'Is one of default pokemons.' : ''}
${item.sprites.front_default}`,

  POKEMON_NOT_FOUND: `I don't know this pokemon. Maybe, you've made a mistake in spelling?`,

  FIRST_GREETING: (user) => {
    return `Hi, @${user.name}!
I'm Pokedex. I know almost everything about pokemons and their types.
Where would you like to start? Try ask me.`;
  },

  RANDOM_GREETING: (user) => {
    const greetings = [
      `Hi, @${user.name}!`,
      `Hello, @${user.name}!`,
      `Nice to see you, @${user.name}!`,
    ];
    return _.sample(greetings);
  },

  POKEMONS_INFO:`There are 811 pokemons of 20 types.
You can ask me about Squirtle or Charizard, Eevee or Pikachu.`,

  TYPE: (item) => `*${upperCaseFirst(item.name)} pokemon type*
Gets half damage from:
${item.damage_relations.half_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.half_damage_from.map((r) => `  - ${r.name}`).join('\n')}
Resistant to:
${item.damage_relations.no_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.no_damage_from.map((r) => `  - ${r.name}`).join('\n')}
Double sensitive to:
${item.damage_relations.double_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.double_damage_from.map((r) => `  - ${r.name}`).join('\n')}
${item.move_damage_class ? `Deals ${item.move_damage_class.name} damage` : ''}`,

  TYPE_NOT_FOUND: `I don't know that type. Try again.`,

  DIDNT_UNDERSTAND: `Not sure what you mean. Could you rephrase please?`,

  YOURE_WELCOME: `You're welcome. Anything else?`,

  OK_HIT_ME: 'Ok, hit me!',
  ALRIGHT: 'Alright!',

  POKEMON_WEIGHT: (item) => `The weight of ${upperCaseFirst(item.name)} is ${item.weight}`,
  POKEMON_NUMBER: (item) => `The number of ${upperCaseFirst(item.name)} in pokedex is ${item.id}`,
};
