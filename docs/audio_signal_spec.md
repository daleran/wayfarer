# Audio & Signal Design Spec

> **Status:** Design Spec
> **Scope:** Procedural audio, soundscapes, reactor hums, and "Signal Interference" effects.

---

## 1. The Sound of the Afterlight

Audio in *Wayfarer* is not just an accompaniment; it is a primary feedback loop. Every mechanical and energy-based action has a corresponding sound.

### 1.1 The Reactor Hum
The ship's reactor provides a continuous, low-frequency base layer.
- **ENG Shift:** Pitch rises as pips are added to engines.
- **Throttle:** Volume and "Oscillation Rate" increase with speed.
- **Hull Damage:** The hum becomes "Stuttery" or adds static layers.

---

## 2. Weapon & Impact Audio

Consistent with `ordinance_spec.md`, weapons have distinct "Voice" profiles.

- **Kinetics (Amber):** Mechanical "Chunk-Chunk" for turrets, low-frequency "Thud" on impact.
- **Beams (Cyan):** High-frequency "Whine" that pulses with power consumption.
- **Missiles:** A "Whoosh" followed by a distant, echoing explosion.
- **Impacts:** Metallic "Clang" for armor hits, "Shattering" sounds for hull breaches.

---

## 3. The Signal & Radio Layer

The lore emphasizes that all computing and communication are primitive.

### 3.1 Radio Static & Hails
- **The Hail:** A "Squelch" sound followed by a text-to-speech style mechanical voice (low-fidelity).
- **Distress Pings:** A rhythmic "Bip-Bip" that gets louder as the player approaches the signal source.
- **Electronic Warfare (Jamming):** Replaces the reactor hum and music with high-frequency noise and static.

---

## 4. Procedural Music & Tension

Music is dynamic and reacts to the "Threat State" of the fleet.

- **Exploration:** Low-tempo, ambient synth pads. Reverb-heavy.
- **Cautious:** Adds rhythmic "Pulse" bass when neutral/red entities enter sensor range.
- **Combat:** Layered drums and high-intensity arpeggios. Increases in volume as fleet hull drops.
- **Concord Encounter:** Eerie, geometric, glitch-heavy soundscapes.

---

## 5. Implementation Phases

- **Phase 1:** Core `AudioManager` with procedural hum and throttle pitch-shifting.
- **Phase 2:** Weapon firing and impact sound effects (using Web Audio oscillators).
- **Phase 3:** Signal interference and radio "Squelch" logic.
- **Phase 4:** Dynamic music transition engine based on "Threat State."
