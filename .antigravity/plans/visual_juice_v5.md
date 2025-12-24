# 📟 Implementation Plan: Visual Juice v5.0 (NEURO-HORROR)

## 🎯 OBJECTIVE
Transform the "flat" and "empty" interface of **Spirit of the Den** into a high-density, atmospheric, and reactive "Cyber-Noir" environment. Shift the aesthetic from a basic web app to a high-fidelity narrative experience.

---

## 🛠️ PHASE 1: GLOBAL ATMOSPHERE & DENSITY
*   **Vignette & CRT Overlay**: Add a global non-interactive overlay that provides a vignette (dark corners) and a persistent CRT scanline pattern.
*   **Grain & Dust**: Increase the opacity of the noise layer and add a subtle "film grain" effect to the body.
*   **Static Monitor Effect**: Implement a subtle "flicker" and "displacement" that happens every few seconds to simulate an old holographic interface.

---

## 📦 PHASE 2: COMPONENT "BEEFING"
*   **Panel v5.0**: Upgrade `.ds-panel-glass` with:
    *   `border-image` for a glowing, multi-color border.
    *   `inset box-shadow` to create depth.
    *   A subtle "carbon fiber" or "hex" texture in the background.
    *   "Industrial" corners using `clip-path` but with visible glowing joints.
*   **Button Micro-Interactions**: 
    *   `hover`: Glow expansion + slight color shift + subtle text glitch.
    *   `active`: "Mechanical" press effect with a brief flicker.

---

## ⚡ PHASE 3: ONBOARDING & EMPTY STATES
*   **The "Lure" Slot**: Redesign empty slots (e.g., in the Farm or Equipment tabs).
    *   Instead of "BLOCK MISSING", use a dashed glowing border.
    *   Add a ghost-icon (low opacity) of what goes there.
    *   Add a subtle "BUY" CTA that pulses when the player has enough money.

---

## ✍️ PHASE 4: TYPOGRAPHIC HIERARCHY
*   **Headers**: Use `Orbitron` with text-shadow (glow) and uppercase styling. Add horizontal bars to frame titles.
*   **Data Points**: Consistent use of `Courier Prime` (mono) for strictly numerical data. Use color-coding (Cyan for cold data, Gold for money, Red for danger).
*   **Sub-labels**: Shrink to 0.65rem with high letter-spacing and 40% opacity.

---

## 🎨 PHASE 5: THE "VIBE" ANIMATIONS
*   **Breathing Glow**: All main panels will have a 4s loop animation of their `box-shadow` and `border-color`.
*   **Randomized Twitch**: A global CSS animation class `fx-twitch` that periodically scales/skews elements by 1% for 50ms.
*   **Information Stream**: Add scrolling ASCII-code or hex strings in the corners of sections to increase visual density.

---

## ✅ SUCCESS CRITERIA
1.  No "pure black" backgrounds visible; everything has texture.
2.  Interactive elements feel "heavy" and mechanical.
3.  The interface feels like a physical monitor, not a browser tab.
