// Ember Duel — deterministic screenshot presets. ?shot=start|play|win|lose&seed=N
// renders the exact same table every time, so screenshots are real renders of
// the game's own code, not mockups.
import { createGame, startDuel, playCard, drawCards, pushLog } from './state.js';
import { cardById } from './cards.js';

function setHand(fighter, ids) {
  fighter.hand = ids.map((id) => cardById(id));
}

export function applyShotPreset(game) {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return null;

  if (shot === 'start') {
    game.phase = 'title';
    return 'start';
  }

  if (shot === 'play') {
    startDuel(game);
    game.round = 4;
    game.score = 34;
    game.damageDealt = 28;
    game.cardsPlayed = 6;
    game.player.hp = 22;
    game.rival.hp = 18;
    game.player.shield = 3;
    game.player.mana = 5;
    game.player.maxMana = 6;
    game.rival.mana = 4;
    game.rival.maxMana = 5;
    setHand(game.player, ['flame-lash', 'thornbloom', 'undertow', 'chill-shard', 'pyro-titan']);
    setHand(game.rival, ['spark-imp', 'bramble', 'ripple', 'frostbite', 'vine-snare']);
    game.lastElement = 'ember';
    pushLog(game, 'Rival plays <b>Frostbite</b> for 3. You shield 3.');
    pushLog(game, 'You play <b>Flame Lash</b> — CHAIN +2! for 6. Rival takes 6.');
    pushLog(game, '<b>Your move</b> — chain Ember again, or answer with Thorn?');
    return 'play';
  }

  if (shot === 'win') {
    startDuel(game);
    game.round = 7;
    game.score = 61;
    game.damageDealt = 52;
    game.cardsPlayed = 11;
    game.player.hp = 14;
    game.rival.hp = 0;
    game.player.mana = 2;
    setHand(game.player, ['bramble', 'ripple', 'vine-snare']);
    setHand(game.rival, []);
    game.phase = 'won';
    pushLog(game, 'You play <b>Tidal Surge</b> for 6. Rival takes 6.');
    return 'win';
  }

  if (shot === 'lose') {
    startDuel(game);
    game.round = 6;
    game.score = 38;
    game.damageDealt = 31;
    game.cardsPlayed = 9;
    game.player.hp = 0;
    game.rival.hp = 9;
    game.player.mana = 1;
    setHand(game.player, ['chill-shard', 'spark-imp']);
    setHand(game.rival, ['cinder-wolf', 'blizzard', 'elder-oak']);
    game.phase = 'lost';
    pushLog(game, 'Rival plays <b>Blizzard</b> for 6. You take 6.');
    return 'lose';
  }

  return null;
}

export function createShotGame() {
  const params = new URLSearchParams(location.search);
  const seed = parseInt(params.get('seed') || '7', 10) || 7;
  const game = createGame(seed);
  // Keep the preset hands deterministic: deal first, then overwrite in the preset.
  drawCards(game.player, 0);
  return game;
}
