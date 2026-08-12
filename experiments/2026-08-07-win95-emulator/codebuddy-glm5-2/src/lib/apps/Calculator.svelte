<script>
  let display = '0'
  let previous = null
  let operator = null
  let waitingForOperand = false
  let memory = 0

  function inputDigit(d) {
    if (waitingForOperand) {
      display = String(d)
      waitingForOperand = false
    } else {
      display = display === '0' ? String(d) : display + d
    }
  }

  function inputDecimal() {
    if (waitingForOperand) {
      display = '0.'
      waitingForOperand = false
    } else if (display.indexOf('.') === -1) {
      display += '.'
    }
  }

  function clearAll() {
    display = '0'
    previous = null
    operator = null
    waitingForOperand = false
  }

  function clearEntry() {
    display = '0'
    waitingForOperand = false
  }

  function backspace() {
    if (waitingForOperand) return
    display = display.length > 1 ? display.slice(0, -1) : '0'
  }

  function negate() {
    display = String(-parseFloat(display))
  }

  function sqrt() {
    const v = parseFloat(display)
    if (v < 0) {
      display = '错误'
      return
    }
    display = String(Math.sqrt(v))
    waitingForOperand = true
  }

  function percent() {
    display = String(parseFloat(display) / 100)
  }

  function reciprocal() {
    const v = parseFloat(display)
    if (v === 0) {
      display = '错误'
      return
    }
    display = String(1 / v)
    waitingForOperand = true
  }

  function compute(op, a, b) {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b === 0 ? '错误' : a / b
      default: return b
    }
  }

  function performOperation(nextOp) {
    const current = parseFloat(display)
    if (previous === null) {
      previous = current
    } else if (operator) {
      const result = compute(operator, previous, current)
      display = String(result)
      previous = typeof result === 'number' ? result : null
    }
    waitingForOperand = true
    operator = nextOp
  }

  function equals() {
    if (operator === null || previous === null) return
    const current = parseFloat(display)
    const result = compute(operator, previous, current)
    display = String(result)
    previous = null
    operator = null
    waitingForOperand = true
  }

  function memClear() { memory = 0 }
  function memRecall() { display = String(memory); waitingForOperand = true }
  function memStore() { memory = parseFloat(display) }
  function memAdd() { memory += parseFloat(display) }
</script>

<div class="calculator">
  <!-- Display -->
  <div class="calc-display bevel-in-thin">
    <input type="text" value={display} readonly />
  </div>

  <!-- Memory + Backspace row -->
  <div class="calc-row">
    <button class="btn95 calc-btn mem-btn" on:click={memClear} title="内存清除">MC</button>
    <button class="btn95 calc-btn mem-btn" on:click={memRecall} title="内存调用">MR</button>
    <button class="btn95 calc-btn mem-btn" on:click={memStore} title="内存存储">MS</button>
    <button class="btn95 calc-btn mem-btn" on:click={memAdd} title="内存加">M+</button>
  </div>

  <div class="calc-row">
    <button class="btn95 calc-btn" on:click={backspace} title="退格">←</button>
    <button class="btn95 calc-btn" on:click={clearEntry} title="清除输入">CE</button>
    <button class="btn95 calc-btn" on:click={clearAll} title="全部清除">C</button>
    <button class="btn95 calc-btn op-btn" on:click={negate} title="正负">±</button>
    <button class="btn95 calc-btn op-btn" on:click={sqrt} title="平方根">√</button>
  </div>

  <!-- Number pad -->
  <div class="calc-numpad">
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(7)}>7</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(8)}>8</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(9)}>9</button>
    <button class="btn95 calc-btn op-btn" on:click={() => performOperation('/')} title="除">/</button>
    <button class="btn95 calc-btn op-btn" on:click={percent} title="百分比">%</button>

    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(4)}>4</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(5)}>5</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(6)}>6</button>
    <button class="btn95 calc-btn op-btn" on:click={() => performOperation('*')} title="乘">*</button>
    <button class="btn95 calc-btn op-btn" on:click={reciprocal} title="倒数">1/x</button>

    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(1)}>1</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(2)}>2</button>
    <button class="btn95 calc-btn num-btn" on:click={() => inputDigit(3)}>3</button>
    <button class="btn95 calc-btn op-btn" on:click={() => performOperation('-')} title="减">-</button>
    <button class="btn95 calc-btn eq-btn" on:click={equals} title="等于">=</button>

    <button class="btn95 calc-btn zero-btn num-btn" on:click={() => inputDigit(0)}>0</button>
    <button class="btn95 calc-btn num-btn" on:click={inputDecimal} title="小数点">.</button>
    <button class="btn95 calc-btn op-btn" on:click={() => performOperation('+')} title="加">+</button>
  </div>
</div>

<style>
  .calculator {
    display: flex;
    flex-direction: column;
    padding: 6px;
    gap: 4px;
    height: 100%;
    background: var(--win-bg);
  }

  .calc-display {
    background: white;
    padding: 3px 4px;
    margin-bottom: 4px;
    text-align: right;
  }

  .calc-display input {
    width: 100%;
    border: none;
    text-align: right;
    font-family: var(--font-mono);
    font-size: 16px;
    background: white;
    color: #000;
    outline: none;
    padding: 2px 4px;
  }

  .calc-row {
    display: flex;
    gap: 3px;
  }

  .calc-btn {
    min-width: 0;
    padding: 4px 6px;
    font-size: 12px;
    height: 26px;
    flex: 1;
  }

  .calc-numpad {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 3px;
    flex: 1;
  }

  .calc-numpad .num-btn {
    grid-row: auto;
  }

  .zero-btn {
    grid-column: span 2;
  }

  .eq-btn {
    grid-row: span 2;
    background: #d4d0c8;
  }

  .op-btn {
    color: #800000;
    font-weight: bold;
  }

  .mem-btn {
    color: #800000;
    font-size: 11px;
  }
</style>
