# Intro Run v0.1 — Jobs & Mechanics

Goal: Can the core tactics loop feel good with simple jobs, clear reactions, readable positioning?
Use only the 6 true starter jobs. Do not dump all 6 into battle 1.

## Intro pacing
- Battle 1: Warder, Duelist, Lanternist
- Battle 2: Add Bowman
- Battle 3: Add Ember Cantor
- Battle 4: Add Courier
Do not add Salt Priest, Puppetwright, Rift Scout, races, job unlocks, or advanced jobs yet.

## Skill format fields
Name, Job, Type, Damage type, Range, Area, Accuracy, Power, Cooldown, Status effect,
Reaction allowed?, Line of sight?, Ends turn?, Special rules.

---
## Warder — beginner protector (HP45 ATK8 MAG2 DEF6 RES3 ACC80 EVA5 SPD8 MOVE3)
Basic: range1 acc80 power4 physical. Reaction: Block — 25% vs physical, reduce dmg 40%, costs 1 RP.
Cannot block magic/fire/burn/status/back attacks. Physical ranged blocked at only 15%.
- Guard Ally: support, adjacent ally, cd1, ends turn. Ally gains Guarded (dmg -30%) 1rd. Cannot self. No stack w/ Brace.
- Shield Bash: phys, r1 acc80 power3, ends turn. Damage + push 1 tile away. If blocked behind: no move +2 collision dmg.
- Brace: self-buff, cd2, ends turn. Guarded: Strong (dmg -45%) 1rd. Push/pull reduced 1 tile. Not vs Burn/Fire.
- Intercept: protection stance, cd3, ends turn. 1rd: adjacent ally hit by single-target physical -> Warder takes it. Once. Costs RP. Not vs area/magic/back.
Passive Heavy Training: -10% physical dmg when above 50% HP.

## Duelist — single-target striker (HP34 ATK10 MAG2 DEF4 RES3 ACC85 EVA12 SPD11 MOVE4)
Basic: r1 acc85 power4 physical. Reaction: vs melee — 15% Parry (dmg -50%) or 10% Dodge (avoid). Parry priority. Costs RP.
Cannot parry ranged/magic/back. Dodge vs ranged only 5%.
- Rival Mark: debuff, r4 acc95, ends turn. Mark foe 3rd. Duelist +3 dmg vs marked. 1 mark per Duelist.
- Quick Cut: phys, r1 acc95 power3, ends turn. If target marked: +2 dmg.
- Hamstring: phys, r1 acc80 power2, cd2, ends turn. Damage + Hampered 2rd (3 if marked). Min MOVE 2.
- Riposte Stance: self-buff, cd3, ends turn. 1rd: if parry a melee, counterattack (70% power, 100% if marked). Once.
Passive Focused Blade: +5% hit vs marked.

## Lanternist — healer / safe-zone support (HP30 ATK3 MAG9 DEF3 RES6 ACC80 EVA8 SPD9 MOVE4)
Basic: r1 acc75 power2 physical (not an attacker). Reaction: Light Guard — vs magic/fire 20% (30% if in lantern light), reduce 30%. Costs RP. Not vs Burn/Fire-tile-start.
Lantern object: HP10, 3rd duration, light radius 2, max 1 per Lanternist / 2 per team. Allies starting turn in light heal 3 HP + gain +5% ACC.
- Warm Light: heal, r4 always hits ally, power8 (=8+MAG), ends turn. +3 if target in light. No overheal.
- Place Lantern: object, r3, cd3, ends turn. Places lantern (radius 2). One per Lanternist (new replaces old).
- Reveal: utility, r4, area radius2, cd2, ends turn. Removes smoke; +5% hit vs enemies in area 1rd. No damage.
- Guiding Glow: buff, r4, cd2, ends turn. Ally gains Inspired 2rd (+10% ACC). If in light: also +1 MOVE 1 turn.
Passive Warm Presence: adjacent allies +2 healing from Warm Light.

## Bowman — ranged attacker (Battle 2) (HP28 ATK8 MAG2 DEF3 RES3 ACC82 EVA8 SPD9 MOVE4)
Basic: range 2-5 acc80 power4 physical, LoS required. Cannot shoot adjacent. Cover reduces hit. High ground +10%.
Reaction: Snap Aim — enemy enters range 2-5 + LoS during movement, 10% weak reaction shot (power2 acc70). Once. Costs RP. Not if adjacent/no LoS/started in range.
- Aimed Shot: ranged, r2-5 acc90 power4, ends turn. If didn't move: +2 dmg.
- High Shot: ranged, r2-5 acc80 power5, cd1, ends turn. If on high ground: +3 dmg.
- Pinning Shot: ranged, r2-5 acc75 power3, cd2, ends turn. Damage + Hampered 2rd. Min MOVE 2.
- Overwatch: stance, cd3, ends turn. 1rd: first enemy entering range 2-5 + LoS gets shot (acc85 power4). Once. Costs RP.
Passive Patient Aim: if didn't move before attacking, +5% hit.

## Ember Cantor — offensive caster / area control (Battle 3) (HP27 ATK3 MAG10 DEF2 RES5 ACC80 EVA6 SPD8 MOVE4)
Basic: r1 acc75 power2 physical (weak). Reaction: Cinder Flare — vs melee 15%: attacker's tile becomes Fire Tile 1rd. Costs RP. Not vs ranged/magic.
- Fire Spark: magic fire, r4 acc85 power5, ends turn. (5+MAG-RES.)
- Ember Tile: terrain, r4 area1, cd2, ends turn. Fire Tile 2rd. Enemy on it: 3 fire dmg + Burn 2rd. No stack.
- Smoke Chant: terrain, r4 radius1, cd3, ends turn. Smoke 2rd: -20% ranged hit through it. Reveal removes it.
- Kindling: magic fire, r4 acc80 power3, cd2, ends turn. Fire dmg. If Burned: refresh + leave Fire Tile 1rd. Else apply Burn 2rd.
Passive Kindled Voice: +2 fire dmg vs Burned.

## Courier — utility / objective (Battle 4) (HP31 ATK6 MAG3 DEF3 RES3 ACC80 EVA14 SPD12 MOVE5)
Basic: r1 acc80 power3 physical. Reaction: Quickstep — vs melee/ranged physical 20%: reduce dmg 25% + move 1 tile away. Costs RP. Not vs magic. Won't move into fire/blocked/off-map/objective.
- Quick Item: item support, r2, ends turn. Use Minor Tonic (heal 12) on self or ally within 2 (extends normal item range).
- Sprint: movement buff, cd2, ends turn NO but disables attacking. +3 MOVE this turn. Can still interact/item/drag/toss.
- Drag Ally: rescue move, adjacent ally, cd1, ends turn. Move ally 1 tile to valid tile adjacent to Courier. No enemy/dead/rooted/into-fire.
- Supply Toss: support, r3, cd3, ends turn. Reduce one ally cooldown by 1. Not once-per-battle skills, not self (v0.1).
Passive Light Pack: if no damaging skill used this round, +5 EVA.

---
## Enemies
### Raider (HP28 ATK7 DEF3 RES2 ACC75 EVA5 SPD8 MOVE4)
Basic r1 acc75 power4. Heavy Swing: r1 acc65 power8 cd2. Teaches Warder Brace/Guard.
### Archer (HP22 ATK6 DEF2 RES2 ACC80 EVA8 SPD9 MOVE4)
Basic Shot r2-5 acc80 power4. Pin Shot r2-5 acc75 power3 + Hampered 2rd. Teaches cover/high ground/healing.
### Spark Caster (HP20 ATK2 MAG8 DEF2 RES5 ACC80 EVA5 SPD8 MOVE3)
Spark r4 acc85 power5 magic. Fire Tile r4 cd3 (Fire Tile 2rd). Teaches magic/fire/Light Guard.

## Battle setups
- B1: Warder/Duelist/Lanternist vs Raider x2, Archer, Spark. Map 10x10 w/ 2 cover near each side, 2 high ground, 1 narrow choke, 1 open flank. Defeat all. 6-10 rounds.
- B2: +Bowman. Raider x2, Archer x2, Spark. More high ground + cover. Teach ranged.
- B3: +Ember. Raider x2, Archer, Spark x2. Fire lanes, smokeable cover, clustering enemies. Teach fire/smoke.
- B4: +Courier. Raider x3, Archer, Spark. Rescue wounded NPC + defeat enemies. Prove Courier useful.

## Hard limits
No job unlocks, no races, no Active timing, no summons, no true revive (KO returns after battle),
no permadeath, only Physical/Magic/Fire/Healing damage, simple AI:
1) if can kill, attack 2) focus weakest nearby 3) melee moves to nearest 4) ranged seeks range avoids adjacency
5) caster uses Fire Tile if it hits/blocks 2+ tiles else Spark. Keep it stupid first.

## Class must-prove checks
Warder: protect adjacent, survive more, push, Intercept moment. If it mostly attacks, failed.
Duelist: focus one, mark matters, strong vs one, weak surrounded. If best at everything, nerf.
Lanternist: heal self/allies, lantern affects positioning, center stronger, Reveal vs smoke. If spams Warm Light, lanterns too weak.
Bowman: range/high ground/cover/min-range all matter. If safely kills all, too strong.
Ember: fire moves enemies, smoke changes ranged, burn readable, setup matters. If just a nuke, nerf.
Courier: rescue, better items, reposition, objectives. Useless in kill-all is OK; useless in rescue = failed.
