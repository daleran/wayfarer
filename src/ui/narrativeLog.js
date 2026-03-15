// NarrativeLog — scrolling log renderer with entry append, choices, barter, and auto-scroll.

export class NarrativeLog {
  constructor(logEl, choicesEl) {
    /** @type {HTMLElement} */
    this._logEl = logEl;
    /** @type {HTMLElement} */
    this._choicesEl = choicesEl;
    /** @type {(() => void) | null} */
    this._choiceResolve = null;
    /** @type {number} */
    this._choiceResult = -1;
    /** @type {Record<string, {name: string, color: string}>} */
    this._npcContext = {};
  }

  // ── Entry methods ──────────────────────────────────────────────────────────

  narrate(text, style = 'flavor') {
    const div = document.createElement('div');
    div.className = `np-entry np-narration np-style-${style}`;
    div.textContent = text;
    this._appendEntry(div);
  }

  dialogue(speaker, text, color = 'var(--p-cyan)') {
    const div = document.createElement('div');
    div.className = 'np-entry np-dialogue';
    const speakerSpan = document.createElement('span');
    speakerSpan.className = 'np-speaker';
    speakerSpan.style.color = color;
    speakerSpan.textContent = speaker;
    const textSpan = document.createElement('span');
    textSpan.className = 'np-text';
    textSpan.textContent = text;
    div.appendChild(speakerSpan);
    div.appendChild(textSpan);
    this._appendEntry(div);
  }

  action(text) {
    const div = document.createElement('div');
    div.className = 'np-entry np-action';
    div.textContent = `> ${text}`;
    this._appendEntry(div);
  }

  result(text, color = 'amber') {
    const div = document.createElement('div');
    div.className = `np-entry np-result np-result-${color}`;
    div.textContent = text;
    this._appendEntry(div);
  }

  divider(label) {
    const div = document.createElement('div');
    div.className = 'np-divider';
    div.innerHTML = `<hr class="np-divider-line"><span class="np-divider-label">${label}</span>`;
    this._appendEntry(div);
  }

  // ── Choices ────────────────────────────────────────────────────────────────

  /** @param {Array<{text: string, disabled?: boolean, reason?: string}>} options */
  choices(options) {
    return new Promise((resolve) => {
      // Render choices inline in the log (not in the bottom choices bar)
      const wrapper = document.createElement('div');
      wrapper.className = 'np-entry np-inline-choices';

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const link = document.createElement('div');
        link.className = 'np-inline-choice';
        if (opt.disabled) {
          link.classList.add('disabled');
          link.textContent = opt.reason ? `${opt.text} — ${opt.reason}` : opt.text;
        } else {
          link.textContent = opt.text;
          link.addEventListener('click', (e) => {
            e.stopPropagation();
            // Mark all choices as spent
            wrapper.classList.add('np-choices-spent');
            // Mark the chosen one
            link.classList.add('chosen');
            // Record action text (strip brackets if present)
            const actionText = opt.text.replace(/^\[|\]$/g, '');
            this.action(actionText);
            resolve(i);
          });
        }
        wrapper.appendChild(link);
      }

      this._appendEntry(wrapper);
    });
  }

  /** Cancel any pending choice (e.g. on panel close). */
  cancelChoices() {
    // Mark any pending inline choices as spent so they become inert
    const pending = this._logEl.querySelectorAll('.np-inline-choices:not(.np-choices-spent)');
    for (const el of pending) {
      el.classList.add('np-choices-spent');
    }
  }

  // ── Barter ─────────────────────────────────────────────────────────────────

  /**
   * @param {object} config
   * @param {string} config.title
   * @param {Array<{id: string, name: string, unit: number, price: number, currency: string, max?: number}>} [config.npcOffering]
   * @param {Array<{id: string, name: string, unit: number, price: number, currency: string}>} [config.playerOffering]
   * @param {string} [config.emptyText]
   * @param {object} game - GameManager reference
   */
  barter(config, game) {
    return new Promise((resolve) => {
      this._choicesEl.classList.add('hidden');

      const div = document.createElement('div');
      div.className = 'np-entry np-barter';

      const title = document.createElement('div');
      title.className = 'np-barter-title';
      title.textContent = config.title;
      div.appendChild(title);

      const body = document.createElement('div');
      body.className = 'np-barter-body';

      /** @type {Record<string, number>} */
      const quantities = {};

      const renderBody = () => {
        body.innerHTML = '';

        // NPC offering (buy)
        if (config.npcOffering?.length) {
          const header = document.createElement('div');
          header.className = 'np-barter-section-label';
          header.textContent = 'AVAILABLE';
          body.appendChild(header);

          for (const item of config.npcOffering) {
            const qty = quantities[item.id] || 0;
            const row = this._buildBarterRow(item, qty, 'buy', game, quantities, renderBody);
            body.appendChild(row);
          }
        }

        // Player offering (sell)
        if (config.playerOffering?.length) {
          const header = document.createElement('div');
          header.className = 'np-barter-section-label';
          header.textContent = 'YOUR GOODS';
          body.appendChild(header);

          for (const item of config.playerOffering) {
            const qty = quantities[item.id] || 0;
            const row = this._buildBarterRow(item, qty, 'sell', game, quantities, renderBody);
            body.appendChild(row);
          }
        }

        if (!config.npcOffering?.length && !config.playerOffering?.length) {
          const empty = document.createElement('div');
          empty.className = 'np-barter-empty';
          empty.textContent = config.emptyText || 'Nothing to trade.';
          body.appendChild(empty);
        }

        // Summary + buttons
        const totalCost = this._calcBarterTotal(config, quantities, 'buy');
        const totalEarn = this._calcBarterTotal(config, quantities, 'sell');

        const summary = document.createElement('div');
        summary.className = 'np-barter-summary';
        if (totalCost > 0) {
          const costSpan = document.createElement('span');
          costSpan.className = 'np-barter-cost';
          costSpan.textContent = `Cost: ${totalCost} scrap`;
          summary.appendChild(costSpan);
        }
        if (totalEarn > 0) {
          const earnSpan = document.createElement('span');
          earnSpan.className = 'np-barter-earn';
          earnSpan.textContent = `Earn: +${totalEarn} scrap`;
          summary.appendChild(earnSpan);
        }
        body.appendChild(summary);

        const btnRow = document.createElement('div');
        btnRow.className = 'np-barter-buttons';

        const hasAnything = totalCost > 0 || totalEarn > 0;
        const canAfford = game.scrap >= totalCost;

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'np-barter-confirm';
        confirmBtn.textContent = 'CONFIRM';
        confirmBtn.disabled = !hasAnything || !canAfford;
        confirmBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          div.classList.add('np-barter-done');
          resolve({ confirmed: true, quantities: { ...quantities } });
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'np-barter-cancel';
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          div.classList.add('np-barter-done');
          resolve({ confirmed: false, quantities: {} });
        });

        btnRow.appendChild(confirmBtn);
        btnRow.appendChild(cancelBtn);
        body.appendChild(btnRow);
      };

      renderBody();
      div.appendChild(body);
      this._appendEntry(div);
    });
  }

  /** @private */
  _buildBarterRow(item, qty, mode, game, quantities, rerender) {
    const row = document.createElement('div');
    row.className = 'np-barter-row';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'np-barter-item-name';
    nameSpan.textContent = item.name;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'np-barter-item-price';
    priceSpan.textContent = `${item.price} scrap`;

    const controls = document.createElement('span');
    controls.className = 'np-barter-controls';

    const minus = document.createElement('button');
    minus.className = 'np-barter-qty-btn';
    minus.textContent = '-';
    minus.disabled = qty <= 0;
    minus.addEventListener('click', (e) => {
      e.stopPropagation();
      if ((quantities[item.id] || 0) > 0) {
        quantities[item.id]--;
        rerender();
      }
    });

    const qtySpan = document.createElement('span');
    qtySpan.className = 'np-barter-qty';
    qtySpan.textContent = String(qty);

    const plus = document.createElement('button');
    plus.className = 'np-barter-qty-btn';
    plus.textContent = '+';

    // Compute max
    let max = Infinity;
    if (mode === 'buy') {
      if (item.max !== undefined) max = Math.min(max, item.max);
      const totalCostIfOne = item.price;
      const affordable = Math.floor(game.scrap / totalCostIfOne);
      max = Math.min(max, affordable);
    } else {
      max = game.cargo[item.id] || 0;
    }
    plus.disabled = qty >= max;

    plus.addEventListener('click', (e) => {
      e.stopPropagation();
      quantities[item.id] = (quantities[item.id] || 0) + 1;
      rerender();
    });

    controls.appendChild(minus);
    controls.appendChild(qtySpan);
    controls.appendChild(plus);

    row.appendChild(nameSpan);
    row.appendChild(priceSpan);
    row.appendChild(controls);
    return row;
  }

  /** @private */
  _calcBarterTotal(config, quantities, mode) {
    let total = 0;
    const list = mode === 'buy' ? config.npcOffering : config.playerOffering;
    for (const item of (list || [])) {
      total += (quantities[item.id] || 0) * item.price;
    }
    return total;
  }

  // ── NPC Context ──────────────────────────────────────────────────────────

  /** @param {Record<string, {name: string, color: string}>} map */
  setNpcContext(map) {
    Object.assign(this._npcContext, map);
  }

  clearNpcContext() {
    this._npcContext = {};
  }

  /**
   * @param {string} id
   * @returns {{name: string, color: string}}
   * @private
   */
  _resolveNpc(id) {
    const npc = this._npcContext[id];
    if (!npc) throw new Error(`Unknown NPC context: "${id}"`);
    return npc;
  }

  /** Dialogue shorthand using NPC context. */
  dln(text, npcId) {
    const npc = this._resolveNpc(npcId);
    this.dialogue(npc.name, text, npc.color);
  }

  // ── Seq ─────────────────────────────────────────────────────────────────────

  /** @param {string[]} lines */
  seq(lines) {
    for (const line of lines) {
      const sepIdx = line.indexOf('::');
      if (sepIdx === -1) {
        // No prefix — narrate as flavor
        this.narrate(line, 'flavor');
        continue;
      }
      const prefix = line.slice(0, sepIdx);
      const text = line.slice(sepIdx + 2);
      switch (prefix) {
        case 'i':  this.narrate(text, 'flavor'); break;
        case 's':  this.result(text, 'green'); break;
        case 'f':  this.result(text, 'red'); break;
        case 'r':  this.result(text, 'amber'); break;
        case 'a':  this.action(text); break;
        case '--': this.divider(text); break;
        default:   this.dln(text, prefix); break;
      }
    }
  }

  // ── Continuation ────────────────────────────────────────────────────────────

  /** @param {string} [prompt] */
  contd(prompt = 'Continue...') {
    return new Promise((resolve) => {
      const div = document.createElement('div');
      div.className = 'np-entry np-continuation';
      const span = document.createElement('span');
      span.className = 'np-continuation-link';
      span.textContent = prompt;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        div.classList.add('np-continuation-spent');
        resolve(undefined);
      });
      div.appendChild(span);
      this._appendEntry(div);
    });
  }

  // ── Tooltip / HTML narration ────────────────────────────────────────────────

  /**
   * Returns an HTML string for embedding in narrateHTML text.
   * @param {string} text
   * @param {string} definition
   * @returns {string}
   */
  tooltip(text, definition) {
    const escaped = definition.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return `<span class="np-tooltip" data-tip="${escaped}">${text}</span>`;
  }

  /** Like narrate() but sets innerHTML (for lines containing tooltips). */
  narrateHTML(html, style = 'flavor') {
    const div = document.createElement('div');
    div.className = `np-entry np-narration np-style-${style}`;
    div.innerHTML = html;
    this._appendEntry(div);
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  /** @private */
  _appendEntry(div) {
    this._logEl.appendChild(div);
    this._scrollToBottom();
  }

  /** @private */
  _scrollToBottom() {
    requestAnimationFrame(() => {
      this._logEl.scrollTop = this._logEl.scrollHeight;
    });
  }

  clear() {
    this._logEl.innerHTML = '';
    this._choicesEl.innerHTML = '';
    this._choicesEl.classList.add('hidden');
  }
}
