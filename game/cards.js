// Ember Duel — the four elements and every card in the deck.
// Each element is told apart by colour AND shape, never by text alone.
export const ELEMENTS = {
  ember: { name: 'Ember', glyph: '▲', art: '🔥', color: '#e2482a' },
  frost: { name: 'Frost', glyph: '◆', art: '❄', color: '#38bdf8' },
  thorn: { name: 'Thorn', glyph: '✚', art: '🌿', color: '#43b581' },
  tide: { name: 'Tide', glyph: '∿', art: '🌊', color: '#7c6cff' },
};

// effect: 'none' | 'heal' | 'draw' | 'shield' | 'mana'  (amount in `value`)
// `text` is flavour only; the effect itself is printed after it, once.
export const CARD_LIBRARY = [
  { id: 'spark-imp', name: 'Spark Imp', element: 'ember', cost: 1, power: 2, effect: 'none', value: 0, text: 'A quick bite of fire.' },
  { id: 'flame-lash', name: 'Flame Lash', element: 'ember', cost: 2, power: 4, effect: 'none', value: 0, text: 'A whip of flame.' },
  { id: 'cinder-wolf', name: 'Cinder Wolf', element: 'ember', cost: 3, power: 5, effect: 'none', value: 0, text: 'It hunts in the ash.' },
  { id: 'pyro-titan', name: 'Pyro Titan', element: 'ember', cost: 4, power: 7, effect: 'none', value: 0, text: 'The mountain stands up.' },
  { id: 'chill-shard', name: 'Chill Shard', element: 'frost', cost: 1, power: 1, effect: 'draw', value: 1, text: 'Cold that sharpens.' },
  { id: 'frostbite', name: 'Frostbite', element: 'frost', cost: 2, power: 3, effect: 'shield', value: 3, text: 'Cold that bites twice.' },
  { id: 'glacial-wall', name: 'Glacial Wall', element: 'frost', cost: 2, power: 0, effect: 'shield', value: 6, text: 'Winter, standing guard.' },
  { id: 'blizzard', name: 'Blizzard', element: 'frost', cost: 4, power: 6, effect: 'draw', value: 1, text: 'White-out. No escape.' },
  { id: 'bramble', name: 'Bramble', element: 'thorn', cost: 1, power: 2, effect: 'heal', value: 2, text: 'Thorns that give back.' },
  { id: 'vine-snare', name: 'Vine Snare', element: 'thorn', cost: 2, power: 3, effect: 'none', value: 0, text: 'Roots that punch back.' },
  { id: 'thornbloom', name: 'Thornbloom', element: 'thorn', cost: 3, power: 4, effect: 'heal', value: 3, text: 'A bloom with teeth.' },
  { id: 'elder-oak', name: 'Elder Oak', element: 'thorn', cost: 4, power: 5, effect: 'heal', value: 5, text: 'Old roots, deep patience.' },
  { id: 'ripple', name: 'Ripple', element: 'tide', cost: 1, power: 2, effect: 'mana', value: 1, text: 'Small waves, steady hands.' },
  { id: 'undertow', name: 'Undertow', element: 'tide', cost: 2, power: 3, effect: 'draw', value: 1, text: 'What pulls down, lifts you.' },
  { id: 'tidal-surge', name: 'Tidal Surge', element: 'tide', cost: 3, power: 6, effect: 'none', value: 0, text: 'The whole sea, at once.' },
  { id: 'deep-leviathan', name: 'Deep Leviathan', element: 'tide', cost: 4, power: 8, effect: 'none', value: 0, text: 'Something old wakes.' },
];

export const MAX_HP = 30;
export const HAND_SIZE = 5;
export const MAX_HAND = 7;
export const MAX_MANA = 8;
export const CHAIN_BONUS = 2;

// Small deterministic PRNG so screenshot seeds reproduce the same table.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeck(cards, rand) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Two copies of each of the 16 cards: a 32-card deck, same for both duelists.
export function buildDeck(rand) {
  const doubled = [];
  for (const card of CARD_LIBRARY) doubled.push(card, card);
  return shuffleDeck(doubled, rand);
}

export function cardById(id) {
  return CARD_LIBRARY.find((c) => c.id === id);
}

// Human-readable effect line used on the card face and in the log.
export function describeEffect(card) {
  if (card.effect === 'heal') return `Heal ${card.value}`;
  if (card.effect === 'draw') return `Draw ${card.value}`;
  if (card.effect === 'shield') return `Shield ${card.value}`;
  if (card.effect === 'mana') return `+${card.value} mana`;
  return '';
}
