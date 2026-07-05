#!/usr/bin/env python3
"""v0.1 placeholder sprites — sized to sit properly on 52px iso tiles.
Cell 24px, 2px upscale = 48px sprites. Front-facing, chunky, readable.
Units: warder, duelist, lanternist, raider, archer, spark."""
from PIL import Image
import json, math, os
S=24; OUT="."

PAL={
 "warder":  dict(skin=(232,190,150),main=(70,100,150),main_sh=(48,72,112),metal=(200,205,215),metal_sh=(150,155,170),hair=(80,55,35),line=(18,14,20)),
 "duelist": dict(skin=(235,198,158),main=(150,60,60),main_sh=(112,44,44),metal=(210,210,220),metal_sh=(160,160,172),hair=(50,35,22),line=(18,14,20)),
 "lanternist":dict(skin=(238,205,168),main=(210,175,70),main_sh=(170,140,52),metal=(250,235,150),metal_sh=(210,190,90),hair=(120,90,60),line=(18,14,20)),
 "raider":  dict(skin=(110,150,80),main=(110,75,52),main_sh=(84,56,38),metal=(150,150,160),metal_sh=(110,110,122),hair=(40,50,30),line=(14,18,12)),
 "archer":  dict(skin=(120,150,75),main=(90,110,70),main_sh=(66,84,52),metal=(180,140,90),metal_sh=(140,105,65),hair=(45,45,25),line=(14,18,12)),
 "spark":   dict(skin=(140,150,70),main=(95,70,120),main_sh=(72,52,92),metal=(230,150,240),metal_sh=(190,110,210),hair=(55,50,30),line=(14,18,12)),
 "bowman":  dict(skin=(230,195,155),main=(60,120,90),main_sh=(44,92,68),metal=(180,140,90),metal_sh=(140,105,65),hair=(70,50,30),line=(18,14,20)),
 "ember":   dict(skin=(235,198,158),main=(200,90,45),main_sh=(160,68,32),metal=(255,180,80),metal_sh=(220,140,55),hair=(60,35,25),line=(20,14,12)),
 "courier": dict(skin=(232,196,156),main=(60,140,150),main_sh=(44,108,116),metal=(200,180,130),metal_sh=(160,140,95),hair=(80,60,40),line=(18,16,20)),
}

def new(): return Image.new("RGBA",(S,S),(0,0,0,0))
def pset(im,x,y,c):
    if 0<=x<S and 0<=y<S: im.putpixel((x,y),c)
def rect(im,x0,y0,x1,y1,c):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): pset(im,x,y,c)

def body(cx,bob,lean):
    reg={"skin":[],"main":[],"hair":[],"metal":[]}
    top=4+bob
    for y in range(top,top+5):
        for x in range(cx-2+lean,cx+3+lean): reg["skin"].append((x,y))
    for x in range(cx-2+lean,cx+3+lean): reg["hair"].append((x,top-1)); reg["hair"].append((x,top))
    ty0=top+5
    for y in range(ty0,ty0+6):
        for x in range(cx-3,cx+4): reg["main"].append((x,y))
    ly0=ty0+6
    for y in range(ly0,ly0+4):
        for x in range(cx-3,cx-1): reg["main"].append((x,y))
        for x in range(cx+2,cx+4): reg["main"].append((x,y))
    for x in range(cx-3,cx-1): reg["metal"].append((x,ly0+4))
    for x in range(cx+2,cx+4): reg["metal"].append((x,ly0+4))
    return reg,top,ty0

def outline(im,cells,line):
    cset=set(cells)
    for (x,y) in cells:
        for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
            if (x+dx,y+dy) not in cset: pset(im,x+dx,y+dy,line)

def shade(im,cells,base,sh):
    if not cells: return
    xmax=max(c[0] for c in cells)
    for (x,y) in cells: pset(im,x,y, sh if x>=xmax-1 else base)

def draw(kind,fk,t):
    p=PAL[kind]; im=new(); bob=0;lean=0;ext=0
    if fk=="idle": bob=0 if t<0.5 else -1
    elif fk=="attack":
        if t<0.34: lean=-1
        elif t<0.67: lean=1;ext=2;bob=-1
        else: lean=2;ext=3
    elif fk=="hurt": lean=-2;bob=1
    reg,top,ty0=body(12,bob,lean)
    allc=[c for k in reg for c in reg[k]]
    outline(im,allc,p["line"])
    shade(im,reg["main"],p["main"],p["main_sh"])
    shade(im,reg["skin"],p["skin"],p["skin_sh"] if "skin_sh" in p else p["skin"])
    for c in reg["hair"]: pset(im,*c,p["hair"])
    for c in reg["metal"]: pset(im,*c,p["metal"])
    pset(im,12-1+lean,top+2,p["line"]); pset(im,12+1+lean,top+2,p["line"])
    hx=12+4; hy=ty0+2
    if kind=="warder":
        rect(im,hx-1,hy-3,hx+1,hy+3,p["metal"])          # shield
        rect(im,hx,hy-2,hx,hy+2,p["metal_sh"])
    elif kind=="duelist":
        L=6+ext
        for i in range(L): pset(im,hx+i,hy-i,p["metal"]); pset(im,hx+i,hy-i-1,p["metal_sh"])
    elif kind=="lanternist":
        rect(im,hx,hy-1,hx+2,hy+2,p["metal"])            # lantern
        pset(im,hx+1,hy-2,p["metal_sh"])
        if fk=="attack" and t>=0.5:
            for a in range(0,360,45):
                pset(im,hx+1+round(3*math.cos(math.radians(a))),hy+round(3*math.sin(math.radians(a))),p["metal"])
    elif kind=="raider":
        L=5+ext
        for i in range(L): pset(im,hx+i,hy-i//2,p["main_sh"])
        rect(im,hx+L-2,hy-L//2-2,hx+L,hy-L//2+1,p["metal"])
        pset(im,12-1+lean,top+4,(240,240,220)); pset(im,12+1+lean,top+4,(240,240,220))
    elif kind=="archer":
        bx=hx+1
        for a in range(-4,5):
            pset(im,bx+round(2*math.cos(a/4*1.4)),hy+a,p["metal"])
        if fk=="attack" and t>=0.67:
            for i in range(5): pset(im,bx+3+i,hy,p["metal_sh"])
    elif kind=="spark":
        sx=hx+1
        for y in range(top,ty0+7): pset(im,sx,y,p["main_sh"])
        rect(im,sx-1,top-2,sx+1,top,p["metal"])
        if fk=="attack" and t>=0.5:
            pset(im,sx-2,top-3,p["metal"]);pset(im,sx+2,top-3,p["metal"])
    elif kind=="bowman":
        # larger vertical bow with string
        bx=hx+2
        for a in range(-5,6):
            pset(im,bx+round(3*math.cos(a/5*1.3)),hy+a,p["metal"])
            if abs(a)<5: pset(im,bx-1,hy+a,p["metal_sh"])  # string
        if fk=="attack" and t>=0.67:
            for i in range(6): pset(im,bx+2+i,hy,p["metal"])  # arrow
    elif kind=="ember":
        # staff with big flame at top
        sx=hx+1
        for y in range(top-1,ty0+7): pset(im,sx,y,p["main_sh"])
        # flame
        for fy,fw in [(top-4,1),(top-3,2),(top-2,2),(top-1,1)]:
            for dx in range(-fw,fw+1): pset(im,sx+dx,fy,p["metal"] if abs(dx)<fw else p["metal_sh"])
        if fk=="attack" and t>=0.5:
            for a in range(0,360,60):
                pset(im,sx+round(3*math.cos(math.radians(a))),top-2+round(3*math.sin(math.radians(a))),p["metal"])
    elif kind=="courier":
        # satchel/pouch on hip + short dagger
        rect(im,hx-1,hy+1,hx+2,hy+4,p["main_sh"])   # satchel
        pset(im,hx,hy+2,p["metal"])
        L=4+ext
        for i in range(L): pset(im,hx+3+i,hy-i,p["metal"])  # dagger
        # speed lines when attacking
        if fk=="attack" and t>=0.34:
            for i in range(3): pset(im,6-i*2,ty0+2,p["metal_sh"])
    return im

FRAMES=[("idle",0.0),("idle",1.0),("attack",0.0),("attack",0.5),("attack",1.0),("hurt",0.0)]
ANIM={"idle":[0,1],"attack":[2,3,4],"hurt":[5]}
chars=["warder","duelist","lanternist","raider","archer","spark","bowman","ember","courier"]
man={"cell":S,"anim":ANIM,"frames":len(FRAMES),"chars":{}}
for cid in chars:
    sheet=Image.new("RGBA",(S*len(FRAMES),S),(0,0,0,0))
    for i,(fk,t) in enumerate(FRAMES):
        c=draw(cid,fk,t); sheet.paste(c,(i*S,0),c)
    big=sheet.resize((sheet.width*2,sheet.height*2),Image.NEAREST)
    big.save(os.path.join(OUT,f"v_{cid}.png"))
    man["chars"][cid]={"file":f"v_{cid}.png"}
print("sprites done")
import base64
out={}
for cid in chars:
    out[cid]="data:image/png;base64,"+base64.b64encode(open(os.path.join(OUT,f"v_{cid}.png"),"rb").read()).decode()
json.dump({"cell":S*2,"anim":ANIM,"frames":len(FRAMES),"img":out},open(os.path.join(OUT,"../src/sprites.json"),"w"))
print("embedded kb ~", sum(len(v) for v in out.values())//1024)
