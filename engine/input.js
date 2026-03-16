class InputHandler {
  constructor() {
    this.keysDown = new Set();
    this._justPressed = new Set();
    this._pendingPress = new Set(); // keys pressed since last consumeJustPressed
    this.mouseScreen = { x: 0, y: 0 };
    this.mouseButtons = { left: false, right: false };
    this._justClicked = false;
    this._pendingClick = false;
    this.wheelDelta = 0;
    this._pendingWheel = 0;

    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      this._pendingWheel += e.deltaY;
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      // Prevent browser default for keys the game uses
      if (['arrowleft','arrowright','arrowup','arrowdown',' ','alt','-','=','backspace','[',']','{','}','tab','f1'].includes(key)) {
        e.preventDefault();
      }
      if (!this.keysDown.has(key)) {
        this._pendingPress.add(key);
      }
      this.keysDown.add(key);
    });
    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key.toLowerCase());
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseScreen.x = e.clientX;
      this.mouseScreen.y = e.clientY;
    });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { this.mouseButtons.left = true; this._pendingClick = true; }
      if (e.button === 2) this.mouseButtons.right = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseButtons.left = false;
      if (e.button === 2) this.mouseButtons.right = false;
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(key) {
    return this.keysDown.has(key.toLowerCase());
  }

  // Returns true only on the first tick after a key is pressed
  wasJustPressed(key) {
    return this._justPressed.has(key.toLowerCase());
  }

  wasJustClicked() {
    return this._justClicked;
  }

  // Called once per game tick by GameManager to advance just-pressed state
  tick() {
    this._justPressed = new Set(this._pendingPress);
    this._pendingPress.clear();
    this._justClicked = this._pendingClick;
    this._pendingClick = false;
    this.wheelDelta = this._pendingWheel;
    this._pendingWheel = 0;
  }

  mouseWorld(camera) {
    return camera.screenToWorld(this.mouseScreen.x, this.mouseScreen.y);
  }
}

export const input = new InputHandler();
