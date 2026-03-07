# Ship Management UI Design Spec

> **Status:** Design Spec
> **Scope:** Fleet management, cargo inventory, captain assignments, and detailed ship status.

---

## 1. The Command Terminal: Overview

The Ship Management Screen (accessed via `Tab` or `M` toggle) is the player's primary interface for fleet operations. It is rendered as a fullscreen, semi-transparent CRT overlay, consistent with the `UI.md` aesthetic.

### 1.1 UI Layout
- **Top Header:** Current Ship Name, Credits, and Faction Reputation (Cyan).
- **Tab Bar:** Navigation between [FLEET], [CARGO], [SYSTEMS], [CREW], and [LOGS].
- **Main Viewport:** Detailed data based on the active tab.
- **Bottom Footer:** Global hotkeys (e.g., [Esc] Close Terminal, [Space] Resume Game).

---

## 2. [FLEET] – The Fleet Overview

The default view. Shows all ships currently in the player's fleet.

### 2.1 Fleet List
- **List Items:** Each ship is a row with a miniature wireframe silhouette.
- **Stat Bars:** Miniature Armor (Yellow), Hull (Red), and Fuel (Cyan) bars for each ship.
- **Ship Status:** Displays "READY", "CRITICAL", or "STALLED" based on hull damage.
- **Active Selection:** Clicking a ship expands its view to show **Modifiers** and **Captain Assignments**.

---

## 3. [CARGO] – The Inventory Grid

The Cargo tab manages the collective inventory of the fleet.

### 3.1 Cargo Breakdown
- **Commodity Grid:** Displays icons and counts for Food, Ore, Tech, Exotics, Medicine, and Data.
- **Capacity Gauge:** A large horizontal bar showing total units vs. fleet-wide capacity.
- **Narrative Items:** A separate section for Data Logs, Maps, and Keepsakes. Selecting a narrative item displays its lore text and associated waypoints.
- **Jettison Mode:** Allow players to "Discard" cargo to free up space or lighten the ship for speed.

---

## 4. [SYSTEMS] – Engineering & The Reactor

This tab is dedicated to the technical health and energy of the flagship.

### 4.1 "Paper Doll" Schematic
A wireframe diagram of the current ship. Damaged sections (engines, hull, weapons) flash amber or red.
- **Energy Pip Matrix:** The primary location for the cyan-themed reactor pip management (see `reactor_systems.md`).
- **Module List:** Installed upgrades (e.g., Overcharged Capacitors, Reinforced Plating) with a "Toggle" switch for each. Disabling a module can save reactor power.

---

## 5. [CREW] – The Captain's Bridge

Management of personnel across the fleet.

### 5.1 Personnel Files
- **Captain Roster:** List of recruited captains with their names, origins (e.g., Grist-born), and **Traits**.
- **Assignment:** A drag-and-drop interface to assign captains to ships in the fleet.
- **Crew Health:** A summary of surviving crew members on each ship. Shows "Casualties" after heavy hull damage.

---

## 6. [LOGS] – History & Mission Data

A text-heavy log of recent activity and mission progress.

### 6.1 Chronicle
- **Active Stories:** Summaries of active story threads (e.g., *The Warlord's Compact*) and current objectives.
- **Bounty List:** A list of currently accepted bounties with last-known-location markers.
- **System Lore:** A repository of found archives and lore fragments.

---

## 7. Aesthetic Integration

- **Primary Colors:** Electric Cyan (`#00ffcc`) for borders and text, Amber (`#ffaa00`) for data values and warnings.
- **CRT Polish:** Subtle flickering, scanlines, and a phosphor bloom effect.
- **Interaction:** Sounds for each tab shift (mechanical clicks or digital "blips").

---

## 8. Implementation Phases

- **Phase 1:** Core Terminal frame and tab-switching logic.
- **Phase 2:** [FLEET] and [CARGO] tabs with dynamic data binding.
- **Phase 3:** [SYSTEMS] tab with interactive "Paper Doll" and Pip Matrix.
- **Phase 4:** [CREW] and [LOGS] tabs with persistent story tracking.
