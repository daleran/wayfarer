# Ordinance & Ballistics Technical Spec

> **Status:** Design Spec
> **Scope:** Weapon physics, projectile types, "Impact Impulse," and damage layering.

---

## 1. Projectile Physics: The "Feel" of Combat

In *Wayfarer*, weapons are not just "Hitpoints Reducers." They are physical entities that interact with the ship's mass and trajectory.

### 1.1 Impact Impulse (Recoil & Impact)
- **Recoil:** Heavy weapons (Railguns, Plasma) push the firing ship backward.
- **Impact:** Projectiles transfer momentum to the target. A small ship hit by a Railgun will be physically knocked off-course.
- **Deflection:** Sharp angles of impact have a chance to "Ricochet" off armor, dealing 20% damage but zero impulse.

---

## 2. Ordinance Catalog: Kinetic & Energy

Consistent with `UI.md` and `reactor_systems.md`, weapons are categorized by color and effect.

### 2.1 Kinetics (Amber/Yellow - `#ffaa00`)
The standard in Tyr. Reliable, physical, and heavy.
- **Autocannon Rounds:** Fast, low mass, high spread. Good for "Nipping" armor.
- **Railgun Slugs:** Extremely high velocity, zero spread, high mass. Punches through armor into the hull.
- **Flak Bursts:** Explode at cursor range. Low damage, high impulse. Excellent for scattering fighter swarms.

### 2.2 Energy & Beams (Cyan - `#00ffcc`)
Rare, expensive, and energy-intensive. Requires **WPN** (Weapon) pips.
- **Ablative Lancer:** A continuous cyan beam. Strips armor at an accelerating rate. 1x damage to hull.
- **Plasma Orbs:** Slow-moving, glowing cyan spheres. High area-of-effect damage, ignores armor ricochet.
- **Ionic Pulse (E-War):** Deals zero hull damage. Temporarily "Stalls" the target's engine or scrambles their HUD.

### 2.3 Missiles & Torpedoes (Amber Trail)
Tactical ordinance with a "Turning Circle."
- **Standard Missile:** Homes toward cursor position. Balanced speed and damage.
- **Armor-Piercing Torpedo:** Extremely slow, massive hull damage. Can be shot down by Point Defense.
- **Stall Missile:** Forces target throttle to "Zero" for 3 seconds on impact.

---

## 3. Damage Layering (Hull vs. Armor)

Projectiles interact with the two-layered defense system differently.

- **Kinetics:** Deal flat damage to armor. If armor is 0, full damage transfers to hull.
- **Beams:** 2.5x damage to armor, 0.5x damage to hull. Designed to strip shields and plating.
- **Explosives:** Deal "Radial" damage. Effective against fighter swarms and cluster-formations.

---

## 4. Point Defense (PD) Logic

PD turrets are autonomous, short-range systems.
- **Logic:** Prioritize the closest non-player entity (Missile, Torpedo, Fighter).
- **Effect:** Deals rapid, low-damage kinetic fire to "Defuse" incoming ordinance before impact.
- **Pip Synergy:** High **SYS** pips increase PD tracking speed and range.

---

## 5. Implementation Phases

- **Phase 1:** Core `Projectile` physics (velocity, mass, lifetime).
- **Phase 2:** Impact momentum transfer and recoil logic.
- **Phase 3:** Specialized beam rendering (continuous line with glow).
- **Phase 4:** Point Defense AI and homing missile turning logic.
