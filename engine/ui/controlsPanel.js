// ControlsPanel — F1 help overlay showing all keybindings.
// Uses the same panel-base frame as station/ship panels, positioned right side.

export class ControlsPanel {
  constructor() {
    this.visible = false;
    this._el = document.getElementById('controls-panel');
    this._built = false;
  }

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      if (!this._built) this._buildDOM();
      this._el.classList.remove('hidden');
    } else {
      this._el.classList.add('hidden');
    }
  }

  close() {
    this.visible = false;
    this._el.classList.add('hidden');
  }

  _buildDOM() {
    this._built = true;

    const sections = [
      {
        title: 'MOVEMENT',
        keys: [
          ['W / ↑', 'Increase throttle'],
          ['S / ↓', 'Decrease throttle'],
          ['A / ←', 'Rotate left'],
          ['D / →', 'Rotate right'],
        ],
      },
      {
        title: 'COMBAT',
        keys: [
          ['F', 'Toggle combat mode'],
          ['LMB / Space', 'Fire primary weapon'],
          ['RMB', 'Fire secondary weapon'],
          ['1', 'Cycle primary ammo'],
          ['2', 'Cycle secondary ammo'],
        ],
      },
      {
        title: 'SYSTEMS',
        keys: [
          ['R', 'Repair / reload weapon'],
          ['E', 'Dock at station / salvage'],
          ['I / Tab', 'Ship status screen'],
          ['M', 'System map'],
        ],
      },
      {
        title: 'MAP CONTROLS',
        keys: [
          ['LMB', 'Set waypoint'],
          ['RMB', 'Clear waypoint'],
          ['Scroll / Drag', 'Zoom / pan'],
        ],
      },
      {
        title: 'GENERAL',
        keys: [
          ['Scroll', 'Zoom in/out'],
          ['Space', 'Pause'],
          ['Esc', 'Close / cancel'],
          ['F1', 'This panel'],
        ],
      },
    ];

    let html = `<div class="cp-header">
      <span class="panel-title">CONTROLS</span>
      <span class="panel-hint">[F1] close</span>
    </div>
    <div class="cp-body">`;

    for (const section of sections) {
      html += `<div class="cp-section">
        <div class="cp-section-title">${section.title}</div>`;
      for (const [key, desc] of section.keys) {
        html += `<div class="cp-row">
          <span class="cp-key">${key}</span>
          <span class="cp-desc">${desc}</span>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    this._el.innerHTML = html;

    this._el.addEventListener('mousedown', (e) => e.stopPropagation());
    this._el.addEventListener('click', (e) => e.stopPropagation());
  }
}
