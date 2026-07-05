# Ridgefall — notes for Claude Code

## Build discipline
- `dist/ridgefall_v0_1.html` is GENERATED. Never edit it directly.
- Edit `src/engine.js` for logic, `tools/gen_sprites.py` for art.
- Rebuild with `cd tools && python3 build.py`. Regenerate art with `python3 gen_sprites.py`.
- After any engine change, sanity-check it parses before shipping (the build prints byte count).

## Architecture (all in src/engine.js, one file by design)
- Map: `MAP`/`TT` (terrain), 10x10, flat with tags. `iso()` projects grid->screen with camera zoom/pan.
- Units: `JOB`/`FOE` templates -> `loadBattle(n)` instantiates. `U()` wraps a template into a live unit.
- Combat: `hitChance()`, `calcDamage()`, `tryReaction()` — all follow the v0.1 spec formulas exactly.
- Skills: `SK` table (one entry per skill). `resolveTargeted()` routes by skill `type`.
- Turn flow: `nextTurn()` -> `startOfTurn()` -> player input or `enemyTurn()` (simple AI).
- Rendering: single canvas, `render()` draws tiles back-to-front then depth-sorted units.
- Debug: `DBG` flags + `window.dbg*` functions wired to the DEBUG panel in the HTML shell (tools/build.py).

## Scope rule (important)
Keep v0.1 small. Prove the core loop first. Do NOT add races, job unlocks, Active Mode,
or new jobs beyond the 6 starters until asked. See spec/.

## Top of the task list
1. Reaction-on-movement system (Bowman Overwatch + Snap Aim actually firing).
2. Battle 4 rescue NPC + rescue win-condition.
3. Wait -> Turn Charge speed bonus.
