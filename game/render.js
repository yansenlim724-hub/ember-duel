// Ember Duel — everything the player sees: hands, bars, log, overlays, motion.
import { ELEMENTS, MAX_HP, MAX_MANA, describeEffect } from './cards.js';
import { chainBonusFor } from './state.js';

const $ = (id) => document.getElementById(id);

export function cardFace(card, game, opts = {}) {
  const el = ELEMENTS[card.element];
  const div = document.createElement('div');
  div.className = `card el-${card.element}`;
  if (opts.spotlight) div.classList.add('spotlight');
  if (opts.unaffordable) div.classList.add('unaffordable');
  const chain = game && !opts.noChain ? chainBonusFor(game, card) : 0;
  div.innerHTML =
    `<div class="cost">${card.cost}</div>` +
    `<div class="suit" title="${el.name}">${el.glyph}</div>` +
    `<div class="name">${card.name}</div>` +
    `<div class="art">${el.art}</div>` +
    `<div class="power">${card.power}${chain ? ` <small>+${chain} chain</small>` : ''} <small>hit</small></div>` +
    `<div class="effect">${card.text}${describeEffect(card) ? ' ' + describeEffect(card) : ''}</div>` +
    (opts.key != null ? `<div class="key">[${opts.key}]</div>` : '');
  return div;
}

export function cardBack() {
  const div = document.createElement('div');
  div.className = 'card back';
  div.textContent = '◈';
  return div;
}

function renderMana(node, mana, maxMana) {
  let html = '';
  for (let i = 0; i < MAX_MANA; i++) {
    const cls = i < mana ? 'orb' : 'orb spent';
    const mark = i < maxMana ? '●' : '○';
    html += `<span class="${cls}">${mark}</span>`;
  }
  node.innerHTML = html + ` <span>${mana}/${maxMana} mana</span>`;
}

function renderHp(fillNode, textNode, fighter) {
  fillNode.style.width = `${(fighter.hp / MAX_HP) * 100}%`;
  const shield = fighter.shield > 0 ? ` 🛡${fighter.shield}` : '';
  textNode.textContent = `${fighter.hp} / ${MAX_HP}${shield}`;
}

export function renderAll(game, ui) {
  renderHp($('playerHpFill'), $('playerHpText'), game.player);
  renderHp($('rivalHpFill'), $('rivalHpText'), game.rival);
  renderMana($('playerMana'), game.player.mana, game.player.maxMana);
  renderMana($('rivalMana'), game.rival.mana, game.rival.maxMana);
  $('roundLabel').textContent = `Round ${game.round}`;
  $('scoreLabel').textContent = `Score ${game.score}`;
  $('winsLabel').textContent = `Wins ${ui.wins}`;

  const hand = $('playerHand');
  hand.innerHTML = '';
  game.player.hand.forEach((card, i) => {
    const node = cardFace(card, game, { key: i + 1, unaffordable: card.cost > game.player.mana });
    node.addEventListener('click', () => ui.onPlayCard(i));
    hand.appendChild(node);
  });

  const rivalHand = $('rivalHand');
  rivalHand.innerHTML = '';
  for (let i = 0; i < game.rival.hand.length; i++) rivalHand.appendChild(cardBack());

  $('log').innerHTML = game.log.map((line) => `<div>${line}</div>`).join('');
  $('endTurnBtn').disabled = game.phase !== 'player';
  $('titleScreen').classList.toggle('hidden', game.phase !== 'title');
}

export function showFloat(text, heal = false) {
  const layer = $('floatLayer');
  const span = document.createElement('div');
  span.className = 'float-dmg' + (heal ? ' heal' : '');
  span.textContent = text;
  layer.appendChild(span);
  setTimeout(() => span.remove(), 1200);
}

export function flashHp(which) {
  const node = which === 'player' ? $('playerHpFill') : $('rivalHpFill');
  node.classList.remove('hpflash');
  void node.offsetWidth;
  node.classList.add('hpflash');
}

export function showEnd(game, ui) {
  const won = game.phase === 'won';
  const title = $('endTitle');
  title.textContent = won ? 'VICTORY' : 'DEFEAT';
  title.classList.toggle('lose', !won);
  $('endLine').textContent = won
    ? 'The last ember is yours. Ash bows, and the four elements answer to you.'
    : 'Ash takes the table this time. The embers are still warm — duel again.';
  $('endStats').innerHTML =
    `Score <b>${game.score}</b> · Damage dealt <b>${game.damageDealt}</b><br>` +
    `Cards played <b>${game.cardsPlayed}</b> · Rounds <b>${game.round}</b><br>` +
    `Your health <b>${game.player.hp}</b> · Rival health <b>${game.rival.hp}</b>`;
  $('endScreen').classList.remove('hidden');
  if (won) ui.wins += 1;
  $('winsLabel').textContent = `Wins ${ui.wins}`;
}
