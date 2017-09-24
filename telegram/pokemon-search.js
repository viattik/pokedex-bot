const Pokedex = require('pokedex-promise-v2');

const p = new Pokedex();


const pokemons = p.getPokemonsList();

module.exports = function(query) {
  return pokemons.then(({ results }) => {
    return results.filter((p) => p.name.match(new RegExp(`${query}`)));
  });
};
