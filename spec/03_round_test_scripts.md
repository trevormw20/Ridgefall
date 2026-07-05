# Round-Based Test Scripts

Do not "play and see what happens." Use controlled rounds where each class is forced
to prove its purpose. Test one or two mechanics per round, not everything at once.

## Testing format
For every test battle track: Round | Class | Skill to test | What it should prove.

## Battle 1 (Warder, Duelist, Lanternist vs Raider x2, Archer, Spark)

### Round 1 — Basic Identity
- Warder: Guard Ally -> Lanternist. (Lanternist gains Guarded.)
- Duelist: Rival Mark -> Raider A. (Raider A becomes marked.)
- Lanternist: Place Lantern -> own/center tile. (Radius 2 glow appears.)
Tests: confirm-tap works, self-tile lantern works, Guard Ally can't self, mark applies, aura visible.

### Round 2 — Damage & Healing
- Warder: Shield Bash -> Raider A. (Pushed 1 tile or collision damage.)
- Duelist: Quick Cut -> marked Raider A. (Bonus damage applies.)
- Lanternist: Warm Light -> lowest HP ally or self. (Heal + light bonus if in aura.)
Tests: push rules, mark bonus, Warm Light self-target, lantern bonus, RP spent correctly.

### Round 3 — Defense & Control
- Warder: Brace -> self. (Strong Guarded.)
- Duelist: Hamstring -> Raider/Archer. (Hampered applies.)
- Lanternist: Guiding Glow -> Duelist or self. (Inspired applies.)
Tests: Brace confirm on own tile, Hampered reduces MOVE, Guiding Glow self-target, Guarded readable.

### Round 4 — Protection Moment
- Warder: Intercept -> self. (Protection stance.)
- Duelist: Riposte Stance -> self. (Counter stance.)
- Lanternist: Reveal -> smoke/enemy area. (Smoke removed or hit bonus.)
Tests: Intercept triggers once + costs RP, Riposte only counters on parry, Reveal has visible value.

### Round 5 — Kill Pressure
- Warder: Shield Bash/Basic -> low HP enemy. (Finish or reposition.)
- Duelist: Quick Cut -> marked target. (Best finisher.)
- Lanternist: Warm Light/Guiding Glow -> ally. (Keeps team alive / improves hit.)
Tests: Duelist kills faster than Warder, Lanternist useful not mandatory, Warder protects not main DPS.

## Battle 2 (add Bowman)
- R1: Bowman Aimed Shot (reliable ranged); Lanternist Guiding Glow -> Bowman; Warder Guard Ally -> backline.
- R2: Bowman High Shot from high ground (bonus dmg); Duelist Rival Mark -> Archer; Warder Shield Bash.
- R3: Bowman Pinning Shot (Hampered); Duelist Quick Cut -> marked Archer; Lanternist Warm Light -> Bowman.
- R4: Bowman Overwatch (threat zone triggers once, costs RP, respects LoS); Warder Guard Ally -> Bowman; Duelist Hamstring -> rusher.
Test: range/high ground/cover matter; Bowman not untouchable.

## Battle 3 (add Ember Cantor)
- R1: Ember Fire Spark (simple readable magic); Lanternist Place Lantern; Warder Guard Ally -> Ember.
- R2: Ember Ember Tile on enemy path (controls movement); Duelist Rival Mark near fire; Warder Shield Bash toward fire.
- R3: Ember Smoke Chant on archer lane (ranged acc drops); Lanternist Reveal (counter); Bowman Aimed Shot outside smoke.
- R4: Ember Kindling on burned target (refresh + fire tile); Bowman Pinning Shot on burning enemy; Duelist Quick Cut finisher.
Test: fire changes enemy decisions; smoke + reveal readable; Ember is setup+payoff not raw nuke.

## Battle 4 (add Courier) — rescue wounded NPC + defeat enemies
- R1: Courier Sprint -> self (moves toward NPC, no attack); Warder Guard Ally; Lanternist Place Lantern (rescue zone).
- R2: Courier Quick Item -> NPC/injured ally (heal at range 2); Warder Shield Bash (clear path); Duelist Rival Mark (threat).
- R3: Courier Drag Ally -> NPC/wounded (to safer tile); Lanternist Warm Light -> NPC/Courier/self; Bowman Overwatch (cover escape).
- R4: Courier Supply Toss -> ally w/ cooldown (reduce by 1); Ember Ember Tile (block pursuit); Warder Intercept (protect escape).
Test: Quick Item + Drag Ally + Supply Toss each justify Courier's existence.

## Round testing rule
Do each test battle twice: (1) play normally — shows natural choices; (2) force each class to use
every skill once — shows whether every skill works and has purpose.

## Log format
Skill | Used? | Felt useful? | Confusing? | Too strong? | Too weak?
Brutal rule: if a skill isn't used naturally in 5 battles, it's too weak/confusing/situational. Fix there.
