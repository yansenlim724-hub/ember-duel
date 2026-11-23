// Ember Duel — the rival. A readable heuristic: you can see what it values
// and play around it. It tells you which element it favours before it moves.
import { CHAIN_BONUS } from './cards.js';

// Score one candidate play: damage now, plus what its effect is worth.
export function valuePlay(game, card, chain) {
  const power = card.power + chain;
  let value = power * 2;
  if (card.effect === 'heal') value += card.value * 1.5;
  if (card.effect === 'shield') value += card.value * 1.2;
  if (card.effect === 'draw') value += 3;
  if (card.effect === 'mana') value += 2;
  // Lethal is worth everything.
  if (power >= game.player.hp) value += 100;
  // Hurt and low: survival beats damage.
  if (game.rival.hp <= 12 && (card.effect === 'heal' || card.effect === 'shield')) value += 12;
  // Don't waste a finisher on an empty threat: save big cards when ahead and safe.
  if (game.rival.hp >= 20 && game.player.hp >= 20 && card.cost >= 4) value -= 4;
  return value;
}

// The rival plays its best affordable card, then the next, while a play is
// clearly worth it. Returns the list of plays, in order, for the renderer.
export function chooseRivalPlays(game) {
  const plays = [];
  const fighter = game.rival;
  let lastElement = null;
  let guard = 0;
  while (guard++ < 4) {
    let best = null;
    let bestValue = 4; // below this, holding the card is smarter than playing it
    for (let i = 0; i < fighter.hand.length; i++) {
      const card = fighter.hand[i];
      if (card.cost > fighter.mana) continue;
      const chain = lastElement === card.element ? CHAIN_BONUS : 0;
      const value = valuePlay(game, card, chain) - card.cost;
      if (value > bestValue) { bestValue = value; best = { index: i, card, chain }; }
    }
    if (!best) break;
    fighter.hand.splice(best.index, 1);
    fighter.discard.push(best.card);
    fighter.mana -= best.card.cost;
    plays.push(best);
    lastElement = best.card.element;
  }
  return plays;
}

// The tell: the element the rival played most last turn, shown before it moves,
// so the player can read the rival and counter it (shield up, heal, or race).
export function rivalTell(game) {
  const counts = {};
  for (const card of game.rival.discard) counts[card.element] = (counts[card.element] || 0) + 1;
  let top = null;
  let topCount = 0;
  for (const [element, count] of Object.entries(counts)) {
    if (count > topCount) { top = element; topCount = count; }
  }
  return top;
}
