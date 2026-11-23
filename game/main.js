// Ember Duel — boot and input. Wires clicks and keys 1–5 / Space to the rules
// in state.js, runs the rival's turn from ai.js, and paints via render.js.
import { createGame, startDuel, startPlayerTurn, playCard, endPlayerTurn, checkEnd, pushLog, drawCards } from './state.js';
import { ELEMENTS } from './cards.js';
import { chooseRivalPlays, rivalTell } from './ai.js';
import { renderAll, showFloat, flashHp, showEnd } from './render.js';
import { applyShotPreset, createShotGame } from './shots.js';

const ui = {
  wins: 0,
  game: null,
  busy: false,
  onPlayCard(index) { void playPlayerCard(index); },
};

function rivalTurn() {
  const game = ui.game;
  game.rival.maxMana = Math.min(8, game.rival.maxMana + 1);
  game.rival.mana = game.rival.maxMana;
  // The rival draws, then chooses — see ai.js for the heuristic.
  // Plays land one beat at a time so the table reads like a duel.
  const step = (plays, i) => {
    if (i >= plays.length) { finishRivalTurn(); return; }
    setTimeout(() => {
      applyRivalPlay(plays[i]);
      step(plays, i + 1);
    }, 650);
  };
  setTimeout(() => {
    drawCards(game.rival, 1);
    const plays = chooseRivalPlays(game);
    const tell = rivalTell(game);
    const tellNode = document.getElementById('rivalTell');
    if (tell) tellNode.textContent = `· favours ${ELEMENTS[tell].name} ${ELEMENTS[tell].glyph}`;
    renderAll(game, ui);
    step(plays, 0);
  }, 500);
}

function applyRivalPlay(play) {
  const game = ui.game;
  const { card, chain } = play;
  const power = card.power + chain;
  let left = power;
  if (game.player.shield > 0) {
    const blocked = Math.min(game.player.shield, left);
    game.player.shield -= blocked;
    left -= blocked;
  }
  game.player.hp = Math.max(0, game.player.hp - left);
  let extra = '';
  if (card.effect === 'heal') { game.rival.hp = Math.min(30, game.rival.hp + card.value); extra = ` Rival heals ${card.value}.`; }
  if (card.effect === 'draw') { extra = ' Rival draws a card.'; }
  if (card.effect === 'shield') { game.rival.shield += card.value; extra = ` Rival shields ${card.value}.`; }
  if (card.effect === 'mana') { extra = ' Rival gains mana.'; }
  pushLog(game, `Rival plays <b>${card.name}</b>${chain ? ` — CHAIN +${chain}!` : ''} for ${power}. You take ${left}.${extra}`);
  showFloat(`-${left}`, false);
  flashHp('player');
  renderAll(game, ui);
  if (game.player.hp <= 0) {
    game.phase = 'lost';
    showEnd(game, ui);
  }
}

function finishRivalTurn() {
  const game = ui.game;
  if (checkEnd(game) === 'player' || game.phase === 'player') return;
  if (game.phase === 'won' || game.phase === 'lost') { showEnd(game, ui); return; }
  startPlayerTurn(game);
  pushLog(game, `<b>Your move</b> — round ${game.round}, ${game.player.mana} mana.`);
  renderAll(game, ui);
}

function playPlayerCard(index) {
  const game = ui.game;
  if (!game || game.phase !== 'player' || ui.busy) return;
  const report = playCard(game, index);
  if (!report) return;
  showFloat(`-${report.dealt}`, false);
  flashHp('rival');
  if (report.extra.includes('heal')) showFloat(`+${game.player.hp}`, true);
  renderAll(game, ui);
  if (game.phase === 'won') showEnd(game, ui);
}

function endTurn() {
  const game = ui.game;
  if (!game || game.phase !== 'player') return;
  endPlayerTurn(game);
  pushLog(game, 'You end your turn. The rival stirs…');
  renderAll(game, ui);
  rivalTurn();
}

function newDuel() {
  const seed = (Date.now() % 2147483647) || 7;
  ui.game = createGame(seed);
  startDuel(ui.game);
  document.getElementById('endScreen').classList.add('hidden');
  renderAll(ui.game, ui);
}

function boot() {
  ui.game = createShotGame();
  const shot = applyShotPreset(ui.game);
  if (shot === 'win' || shot === 'lose') {
    renderAll(ui.game, ui);
    showEnd(ui.game, ui);
    return;
  }
  if (shot === 'play') {
    renderAll(ui.game, ui);
    // Highlight the card the player is about to chain, for the screenshot.
    const hand = document.getElementById('playerHand');
    const first = hand.querySelector('.card');
    if (first) first.classList.add('spotlight');
    return;
  }
  renderAll(ui.game, ui);

  document.getElementById('startBtn').addEventListener('click', () => {
    ui.game = createGame((Date.now() % 2147483647) || 7);
    startDuel(ui.game);
    renderAll(ui.game, ui);
  });
  document.getElementById('againBtn').addEventListener('click', newDuel);
  document.getElementById('endTurnBtn').addEventListener('click', endTurn);
  document.addEventListener('keydown', (event) => {
    const game = ui.game;
    if (!game) return;
    if (game.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      document.getElementById('startBtn').click();
      return;
    }
    if ((game.phase === 'won' || game.phase === 'lost') && event.key === 'Enter') {
      newDuel();
      return;
    }
    if (game.phase !== 'player') return;
    if (event.key >= '1' && event.key <= '5') playPlayerCard(Number(event.key) - 1);
    if (event.key === ' ') { event.preventDefault(); endTurn(); }
  });
}

boot();
