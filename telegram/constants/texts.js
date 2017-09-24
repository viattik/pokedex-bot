const upperCaseFirst = require('upper-case-first');

module.exports = {
  DEFAULT: `Hi. I'm Pokedex. I know almost everything about pokemons and their types.
Where would you like to start?
[/pokemons] - list all available pokemons.
[/types] - list pokemon types.`,

  POKEMON_LIST: (pageNumber, items) => `*Pokemons ${pageNumber*20+1} - ${(Number(pageNumber) + 1)*20}*
${items.map((item) => `${upperCaseFirst(item.name)} [/pokemon_${item.name}]`).join('\n')}`,

  POKEMON: (item) => `*${upperCaseFirst(item.name)}* [/pokemon_${item.name}]
Number in pokedex: ${item.id}
Weight: ${item.weight}
Base experience: ${item.base_experience}
Types:
${item.types.map((t) => `  - ${t.type.name} [/type_${t.type.name}]`).join('\n')}
Abilities:
${item.abilities.map((a) => `  - ${a.ability.name}`).join('\n')}
${item.is_default ? 'Is one of default pokemons.' : ''}`,

  TYPES_LIST: (items) => `*Pokemon types*
${items.map((item) => `${upperCaseFirst(item.name)} [/type_${item.name}]`).join('\n')}`,

  TYPE: (item) => `*${upperCaseFirst(item.name)} pokemon type*
Gets half damage from:
${item.damage_relations.half_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.half_damage_from.map((r) => `  - ${r.name} [/type_${r.name}]`).join('\n')}
Resistant to:
${item.damage_relations.no_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.no_damage_from.map((r) => `  - ${r.name} [/type_${r.name}]`).join('\n')}
Double sensitive to:
${item.damage_relations.double_damage_from.length === 0 ? '  ---' : ''}${item.damage_relations.double_damage_from.map((r) => `  - ${r.name} [/type_${r.name}]`).join('\n')}
${item.move_damage_class ? `Deals ${item.move_damage_class.name} damage` : ''}
Also, you can see the list of pokemons of this type: [/type_${item.name}_pokemons]`,

  TYPE_POKEMONS: (item) => `*Pokemons of ${item.name} type*
${item.pokemon.map((p) => `- ${upperCaseFirst(p.pokemon.name)} [/pokemon_${p.pokemon.name}]`).join('\n')}
`,
};
