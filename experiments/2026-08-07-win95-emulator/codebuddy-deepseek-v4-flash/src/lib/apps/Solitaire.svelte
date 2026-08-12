<script>
  import { onMount } from 'svelte';

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  let stock = [];
  let waste = [];
  let foundations = [[], [], [], []];
  let tableau = [[], [], [], [], [], [], []];
  let selected = null;
  let moves = 0;

  function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, faceUp: false });
      }
    }
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function init() {
    const deck = createDeck();
    stock = deck;
    waste = [];
    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    selected = null;
    moves = 0;
    // 发牌到 tableau
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = stock.pop();
        card.faceUp = j === i;
        tableau[j].push(card);
      }
    }
  }

  function drawStock() {
    if (stock.length === 0) {
      // 回收 waste
      stock = waste.reverse().map(c => ({ ...c, faceUp: false }));
      waste = [];
      return;
    }
    const card = stock.pop();
    card.faceUp = true;
    waste.push(card);
    moves++;
  }

  function cardColor(card) {
    return (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
  }

  function canPlaceOnTableau(card, target) {
    if (target.length === 0) return true;
    const top = target[target.length - 1];
    const rankOrder = RANKS.indexOf(card.rank);
    const topOrder = RANKS.indexOf(top.rank);
    return topOrder === rankOrder + 1 && cardColor(card) !== cardColor(top);
  }

  function canPlaceOnFoundation(card, foundation) {
    if (foundation.length === 0) return card.rank === 'A';
    const top = foundation[foundation.length - 1];
    return top.suit === card.suit && RANKS.indexOf(card.rank) === RANKS.indexOf(top.rank) + 1;
  }

  function onTableauClick(ci, cardIndex) {
    const pile = tableau[ci];
    const card = pile[cardIndex];
    if (!card.faceUp) {
      // 翻开最上面的牌
      if (cardIndex === pile.length - 1) {
        card.faceUp = true;
        moves++;
      }
      return;
    }
    if (selected) {
      // 尝试放置
      const moving = selected.cards;
      if (canPlaceOnTableau(moving[0], pile)) {
        tableau[selected.col].splice(selected.start);
        pile.push(...moving);
        // 翻开新顶牌
        const newTop = tableau[selected.col][tableau[selected.col].length - 1];
        if (newTop && !newTop.faceUp) newTop.faceUp = true;
        moves++;
      }
      selected = null;
    } else {
      // 选择一叠牌
      selected = { col: ci, start: cardIndex, cards: pile.slice(cardIndex) };
    }
  }

  function onFoundationClick(fi) {
    if (selected) {
      const moving = selected.cards;
      if (moving.length === 1 && canPlaceOnFoundation(moving[0], foundations[fi])) {
        tableau[selected.col].splice(selected.start);
        foundations[fi].push(moving[0]);
        const newTop = tableau[selected.col][tableau[selected.col].length - 1];
        if (newTop && !newTop.faceUp) newTop.faceUp = true;
        moves++;
      }
      selected = null;
    }
  }

  function onWasteClick() {
    if (selected) return;
    if (waste.length === 0) return;
    const card = waste[waste.length - 1];
    // 尝试放到 foundation
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(card, foundations[i])) {
        waste.pop();
        foundations[i].push(card);
        moves++;
        return;
      }
    }
  }

  function checkWin() {
    return foundations.every(f => f.length === 13);
  }

  $: won = checkWin();

  onMount(init);
</script>

<div class="solitaire">
  <div class="top-row">
    <div class="stock" onclick={drawStock}>
      {#if stock.length > 0}
        <div class="card back">🂠</div>
      {:else}
        <div class="card empty">↻</div>
      {/if}
    </div>
    <div class="waste" onclick={onWasteClick}>
      {#if waste.length > 0}
        <div class="card {cardColor(waste[waste.length-1])}">
          <span class="rank">{waste[waste.length-1].rank}</span>
          <span class="suit">{waste[waste.length-1].suit}</span>
        </div>
      {:else}
        <div class="card empty"></div>
      {/if}
    </div>
    <div class="foundations">
      {#each foundations as foundation, fi}
        <div class="foundation" onclick={() => onFoundationClick(fi)}>
          {#if foundation.length > 0}
            <div class="card {cardColor(foundation[foundation.length-1])}">
              <span class="rank">{foundation[foundation.length-1].rank}</span>
              <span class="suit">{foundation[foundation.length-1].suit}</span>
            </div>
          {:else}
            <div class="card empty"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="tableau">
    {#each tableau as pile, ci}
      <div class="pile">
        {#each pile as card, cardIndex}
          <div
            class="card {card.faceUp ? cardColor(card) : 'back'}"
            class:selected={selected && selected.col === ci && cardIndex >= selected.start}
            style="top:{cardIndex * 22}px;"
            onclick={() => onTableauClick(ci, cardIndex)}
          >
            {#if card.faceUp}
              <span class="rank">{card.rank}</span>
              <span class="suit">{card.suit}</span>
            {:else}
              <span class="back-pattern">🂠</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  {#if won}
    <div class="win-banner">🎉 你赢了！共 {moves} 步</div>
  {/if}
</div>

<style>
  .solitaire {
    position: relative;
    height: 100%;
    background: #008000;
    padding: 10px;
    overflow: hidden;
  }
  .top-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  .stock, .waste, .foundation {
    width: 70px;
    height: 100px;
    position: relative;
  }
  .foundations {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
  .card {
    width: 70px;
    height: 100px;
    background: #fff;
    border: 1px solid #000;
    border-radius: 4px;
    position: relative;
    cursor: pointer;
    box-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  }
  .card.red { color: #d00; }
  .card.black { color: #000; }
  .card.back {
    background: linear-gradient(135deg, #0000a8, #000080);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 30px;
  }
  .card.empty {
    background: transparent;
    border: 2px dashed rgba(255,255,255,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.6);
    font-size: 20px;
  }
  .rank {
    position: absolute;
    top: 3px;
    left: 5px;
    font-size: 14px;
    font-weight: bold;
  }
  .suit {
    position: absolute;
    bottom: 3px;
    right: 5px;
    font-size: 18px;
  }
  .tableau {
    display: flex;
    gap: 10px;
    position: relative;
  }
  .pile {
    width: 70px;
    height: 300px;
    position: relative;
  }
  .pile .card {
    position: absolute;
    left: 0;
  }
  .card.selected {
    outline: 2px solid #ff0;
  }
  .win-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border: 2px solid #000;
    padding: 20px 30px;
    font-size: 18px;
    font-weight: bold;
    z-index: 10;
  }
</style>
