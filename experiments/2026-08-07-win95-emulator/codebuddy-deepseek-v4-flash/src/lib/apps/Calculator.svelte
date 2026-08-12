<script>
  let display = '0';
  let current = null;
  let operator = null;
  let waitingForOperand = false;

  function inputDigit(d) {
    if (waitingForOperand) {
      display = d;
      waitingForOperand = false;
    } else {
      display = display === '0' ? d : display + d;
    }
  }

  function inputDot() {
    if (waitingForOperand) {
      display = '0.';
      waitingForOperand = false;
    } else if (!display.includes('.')) {
      display += '.';
    }
  }

  function setOperator(op) {
    const inputValue = parseFloat(display);
    if (operator && !waitingForOperand) {
      const result = calculate(current, inputValue, operator);
      display = String(result);
      current = result;
    } else {
      current = inputValue;
    }
    operator = op;
    waitingForOperand = true;
  }

  function calculate(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? '错误' : a / b;
      default: return b;
    }
  }

  function equals() {
    if (operator == null) return;
    const inputValue = parseFloat(display);
    const result = calculate(current, inputValue, operator);
    display = String(result);
    current = null;
    operator = null;
    waitingForOperand = true;
  }

  function clear() {
    display = '0';
    current = null;
    operator = null;
    waitingForOperand = false;
  }

  function clearEntry() {
    display = '0';
    waitingForOperand = false;
  }

  function backspace() {
    if (waitingForOperand) return;
    display = display.length > 1 ? display.slice(0, -1) : '0';
  }

  function negate() {
    display = display.startsWith('-') ? display.slice(1) : '-' + display;
  }

  function percent() {
    display = String(parseFloat(display) / 100);
  }

  function sqrt() {
    display = String(Math.sqrt(parseFloat(display)));
  }

  function reciprocal() {
    const v = parseFloat(display);
    display = v === 0 ? '错误' : String(1 / v);
  }
</script>

<div class="calc">
  <div class="display win-inset">{display}</div>
  <div class="keys">
    <button class="key" onclick={backspace}>⌫</button>
    <button class="key" onclick={clearEntry}>CE</button>
    <button class="key" onclick={clear}>C</button>
    <button class="key op" onclick={() => setOperator('/')}>÷</button>

    <button class="key" onclick={() => inputDigit('7')}>7</button>
    <button class="key" onclick={() => inputDigit('8')}>8</button>
    <button class="key" onclick={() => inputDigit('9')}>9</button>
    <button class="key op" onclick={() => setOperator('*')}>×</button>

    <button class="key" onclick={() => inputDigit('4')}>4</button>
    <button class="key" onclick={() => inputDigit('5')}>5</button>
    <button class="key" onclick={() => inputDigit('6')}>6</button>
    <button class="key op" onclick={() => setOperator('-')}>−</button>

    <button class="key" onclick={() => inputDigit('1')}>1</button>
    <button class="key" onclick={() => inputDigit('2')}>2</button>
    <button class="key" onclick={() => inputDigit('3')}>3</button>
    <button class="key op" onclick={() => setOperator('+')}>+</button>

    <button class="key" onclick={negate}>±</button>
    <button class="key" onclick={() => inputDigit('0')}>0</button>
    <button class="key" onclick={inputDot}>.</button>
    <button class="key eq" onclick={equals}>=</button>
  </div>
</div>

<style>
  .calc {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px;
    background: var(--win-face);
    gap: 8px;
  }
  .display {
    text-align: right;
    padding: 6px 8px;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    background: #fff;
    color: #000;
    overflow: hidden;
    white-space: nowrap;
  }
  .keys {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    flex: 1;
  }
  .key {
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    font-family: var(--win-font);
    font-size: 15px;
    cursor: pointer;
  }
  .key:active {
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
  }
  .key.op {
    color: #a00000;
    font-weight: bold;
  }
  .key.eq {
    background: #d4d0c8;
    font-weight: bold;
  }
</style>
