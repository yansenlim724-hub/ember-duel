// Ember Duel — game state and turn rules. No DOM here: pure rules, easy to test.
import { MAX_HP, HAND_SIZE, MAX_HAND, MAX_MANA, CHAIN_BONUS, buildDeck, mulberry32 } from './cards.js';

export function createGame(seed) {
  const rand = mulberry32(seed || (Date.now() % 2147483647));
  return {
    seed,
    rand,
    round: 1,
    phase: 'title', // title | player | rival | won | lost
    player: freshFighter(buildDeck(rand)),
    rival: freshFighter(buildDeck(rand)),
    lastElement: null, // element of the last card played this turn (chain rule)
    score: 0,
    damageDealt: 0,
    cardsPlayed: 0,
    log: [],
  };
}

function freshFighter(deck) {
  return {
    hp: MAX_HP,
    shield: 0,
    mana: 2,
    maxMana: 2,
    deck,
    hand: [],
    discard: [],
  };
}

export function drawCards(fighter, count) {
  for (let i = 0; i < count; i++) {
    if (fighter.hand.length >= MAX_HAND) break;
    if (fighter.deck.length === 0) {
      fighter.deck = fighter.discard.splice(0).reverse();
      if (fighter.deck.length === 0) break;
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function startDuel(game) {
  drawCards(game.player, HAND_SIZE);
  drawCards(game.rival, HAND_SIZE);
  game.phase = 'player';
  pushLog(game, 'The duel begins. <b>Your move</b> — play a card, then end your turn.');
}

// Mana grows by 1 each round, refills at the start of your turn.
export function startPlayerTurn(game) {
  game.round += 1;
  game.player.maxMana = Math.min(MAX_MANA, game.player.maxMana + 1);
  game.player.mana = game.player.maxMana;
  game.lastElement = null;
  drawCards(game.player, 1);
  game.phase = 'player';
}

function applyDamage(target, amount) {
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked;
    left -= blocked;
  }
  target.hp = Math.max(0, target.hp - left);
  return left;
}

export function chainBonusFor(game, card) {
  return game.lastElement && game.lastElement === card.element ? CHAIN_BONUS : 0;
}

export function canPlay(game, card) {
  return game.phase === 'player' && card.cost <= game.player.mana;
}

// Play one card from the player's hand. Returns a report for the renderer/log.
export function playCard(game, handIndex) {
  const fighter = game.player;
  const card = fighter.hand[handIndex];
  if (!card || !canPlay(game, card)) return null;
  fighter.hand.splice(handIndex, 1);
  fighter.discard.push(card);
  fighter.mana -= card.cost;
  const chain = chainBonusFor(game, card);
  const power = card.power + chain;
  const dealt = applyDamage(game.rival, power);
  game.damageDealt += dealt;
  game.score += dealt + 2;
  game.cardsPlayed += 1;
  let extra = '';
  if (card.effect === 'heal') { fighter.hp = Math.min(MAX_HP, fighter.hp + card.value); extra = ` You heal ${card.value}.`; }
  if (card.effect === 'draw') { drawCards(fighter, card.value); extra = ` You draw ${card.value}.`; }
  if (card.effect === 'shield') { fighter.shield += card.value; extra = ` Shield +${card.value}.`; }
  if (card.effect === 'mana') { fighter.mana = Math.min(fighter.maxMana, fighter.mana + card.value); extra = ` +${card.value} mana.`; }
  game.lastElement = card.element;
  const report = { card, power, chain, dealt, extra, target: 'rival' };
  pushLog(game, `You play <b>${card.name}</b>${chain ? ` — CHAIN +${chain}!` : ''} for ${power}. Rival takes ${dealt}.${extra}`);
  if (game.rival.hp <= 0) game.phase = 'won';
  return report;
}

export function endPlayerTurn(game) {
  if (game.phase !== 'player') return;
  game.phase = 'rival';
}

export function checkEnd(game) {
  if (game.rival.hp <= 0) game.phase = 'won';
  else if (game.player.hp <= 0) game.phase = 'lost';
  return game.phase;
}

export function pushLog(game, line) {
  game.log.push(line);
  if (game.log.length > 4) game.log.shift();
}
