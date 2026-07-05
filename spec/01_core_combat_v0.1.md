# Core Combat v0.1 — Locked Numbers

Do not touch all 27 jobs yet. Build the smallest playable battle first.

## Battle Type
Grid-based tactical RPG. Recommended starting setup:
- Square grid
- 5 player units max
- 5 to 8 enemies
- Average battle length: 8 to 12 rounds
- Objective: mostly defeat enemies at first, then add rescue, escape, switches, treasure, survival

## Unit Stats
Every unit has: HP, ATK (physical dmg), MAG (magic/healing), DEF (phys defense),
RES (magic defense), ACC (hit bonus), EVA (dodge), SPD (turn speed), MOVE (range).
Do not add luck, spirit, faith, bravery, weapon mastery, or race stats yet.

## Turn System
Individual unit turns, not team turns. Each unit has Speed; higher = sooner.
Turn: 1) start effects 2) move 3) act 4) reaction may happen 5) end.
A unit may move-then-act, act-then-move, or wait. Waiting gives a small turn-speed bonus.

### Turn Order (speed bar)
Hidden Turn Charge starts at 0. Each tick: Turn Charge += SPD. At 100, unit acts, then -=100.
Wait (no main action): -=80. (Makes waiting slightly useful without complexity.)

## Action Types
One Main Action per turn: basic attack, command skill, item, defend, or interact. No bonus actions yet.

## Movement (tile cost)
Normal 1, Cover 1, High ground 1, Rough ground 2, Fire tile 1 (causes Burn), Blocked = cannot enter.
Do not build real elevation yet. High Ground is just a tile tag.

## Facing
After moving/acting, choose a facing. Attack angle bonus: Front +0%, Side +10%, Back +20%.

## Hit Formula
Hit Chance = Skill Accuracy + Attacker ACC - Defender EVA + Position Bonus + Terrain Bonus
Clamp 20% min, 95% max. No 0%, no 100%.

### Terrain hit modifiers
Attacker on high ground w/ ranged: +10%. Defender in cover vs ranged: -15%. Defender in smoke: -20%.

## Damage Formula
Physical = Skill Power + ATK - DEF. Magic = Skill Power + MAG - RES. Healing = Skill Power + MAG.
Minimum damage 1, minimum healing 1. No scaling percentages yet.

## Reaction System
Each unit gets 1 Reaction Point per round. A reaction needs: an RP, valid condition,
not rooted/stunned, reactable attack type. Classic Mode only (auto-rolled). Active timing comes later.
Round = after every living unit has had one turn. At new round, all living units regain 1 RP (max 1, no stacking).

### Reaction priority
1) Defender's personal reaction 2) Protector (Warder Intercept) 3) Terrain/object 4) Passives.

## Status Effects v0.1 (only these)
Guarded (1rd, reduce incoming dmg), Marked (3rd, bonus from certain skills),
Exposed (2rd, lower DEF/EVA), Hampered (2rd, MOVE-1), Burn (2rd, fire dmg at start of turn),
Inspired (2rd, small ACC bonus), Rooted (1rd, cannot move can still act).
Same status doesn't stack (refresh duration). Stronger replaces weaker. Burn doesn't stack.

## Terrain v0.1
Normal, Cover (-15% ranged vs unit), High Ground (+10% ranged from tile),
Fire Tile (Burn on enter/start), Rough Ground (2 move), Blocked (impassable), Objective (unchangeable).
No Mapbreaker, no destructible/water/ice.

### Fire Tile rules
Lasts 2 rounds. Enter = Burn 2 rounds. Start turn on it = 4 fire dmg. Burn status = 3 fire dmg at start.
Cannot place on blocked/objective/spawn/story-object tiles.

## Items
One item for v0.1 — Minor Tonic: heal 12, self or adjacent ally, 1 use per unit per battle, uses main action.

## Build Order
1) Grid movement 2) Turn order 3) Basic attack 4) Damage/death 5) Hit chance 6) Reaction Point
7) Classic reaction rolls 8) Warder/Duelist/Lanternist 9) First test battle 10) Then Bowman/Ember/Courier.

## Do Not Build Yet
Races, 27 jobs, job unlocks, Witness, Mapbreaker, Weather Witch, Active Mode, full ability trees,
advanced passives, complex AI.

## Balance Targets
Basic attack 6-10 dmg. Strong skill 10-16. Big enemy hit 12-18. Heal 14-20.
Duelist kills normal enemy in ~3 hits; Warder 4-5; Lanternist weak; Bowman 3-4; Ember 2-4; Courier slow.
Survivability (normal hits): Warder 5-6, Duelist 3-4, Lanternist 2-3, Bowman 2-3, Ember 2-3, Courier 3 (via eva).

## The Most Important Rule
Judge the game by: did the battle create interesting decisions every turn? If yes, expand. If no, more jobs won't save it.
