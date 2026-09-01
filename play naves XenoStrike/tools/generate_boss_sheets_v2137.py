#!/usr/bin/env python3
"""Generate anatomical boss sprite sheets for SWARM//RIFT v2.13.7.

The generator uses localized non-rigid warps over the supplied final boss art.
It never animates a state by only translating/rotating/scaling the full PNG.
Each family has its own region map (wings, abdomen, legs/head/resonators) and
five state timelines: idle, attack, hurt, phase, death.
"""
from __future__ import annotations
import json, math, shutil
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
FRAME = 384
COLS = 4
STATES = {"idle": 8, "attack": 6, "hurt": 4, "phase": 8, "death": 10}
SRC = ROOT / "assets" / "boss_final_v2137"
OUT = ROOT / "assets" / "boss_anim"

BOSSES = {
    "colossus": {"file": "boss_colossus_hop_final.png", "accent": (210,255,86), "identity":"locust-kinetic-compression"},
    "sanguina": {"file": "boss_sanguina_prime_final.png", "accent": (255,63,92), "identity":"mosquito-vascular-siphon"},
    "architect": {"file": "boss_architect_zero_final.png", "accent": (255,190,70), "identity":"termite-queen-living-fortress"},
    "auralis": {"file": "boss_auralis_final.png", "accent": (80,226,255), "identity":"dragonfly-prismatic-interceptor"},
    "resonator": {"file": "boss_resonator_omega_final.png", "accent": (214,153,255), "identity":"cicada-cathedral-resonance"},
}

def fit_rgba(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGBA")
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    target = 360
    im.thumbnail((target, target), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (FRAME, FRAME), (0,0,0,0))
    canvas.alpha_composite(im, ((FRAME-im.width)//2, (FRAME-im.height)//2))
    return np.asarray(canvas).copy()

def ellipse_weight(X,Y,cx,cy,rx,ry,power=2.0):
    q=((X-cx)/max(rx,1))**2+((Y-cy)/max(ry,1))**2
    return np.exp(-np.power(q, power/2.0)*2.1).astype(np.float32)

def remap_local(img: np.ndarray, ops: list[tuple]) -> np.ndarray:
    h,w=img.shape[:2]
    Y,X=np.mgrid[0:h,0:w].astype(np.float32)
    mx=X.copy(); my=Y.copy()
    for op in ops:
        kind,cx,cy,rx,ry,*vals=op
        wt=ellipse_weight(X,Y,cx,cy,rx,ry,2.2)
        if kind=="translate":
            dx,dy=vals; mx -= dx*wt; my -= dy*wt
        elif kind=="scale":
            sx,sy=vals
            mx -= (X-cx)*(sx*wt)/(1.0+sx*wt+1e-6)
            my -= (Y-cy)*(sy*wt)/(1.0+sy*wt+1e-6)
        elif kind=="rotate":
            (ang,)=vals
            a=-ang*wt
            ca=np.cos(a); sa=np.sin(a)
            dx=X-cx; dy=Y-cy
            rxp=ca*dx-sa*dy; ryp=sa*dx+ca*dy
            mx += (rxp-dx); my += (ryp-dy)
        elif kind=="shear":
            shx,shy=vals
            mx -= (Y-cy)*shx*wt
            my -= (X-cx)*shy*wt
    # premultiply for clean transparent interpolation
    f=img.astype(np.float32)/255.0
    a=f[...,3:4]
    prem=np.concatenate([f[...,:3]*a,a],axis=2)
    warped=cv2.remap(prem,mx,my,cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
    wa=np.clip(warped[...,3:4],0,1)
    rgb=np.where(wa>1e-5,np.clip(warped[...,:3]/np.maximum(wa,1e-5),0,1),0)
    out=np.concatenate([rgb,wa],axis=2)
    return np.clip(out*255,0,255).astype(np.uint8)

def add_glow(arr, accent, amount=.28, radius=10, center=None, ring=False):
    im=Image.fromarray(arr,"RGBA")
    a=im.getchannel("A")
    if center is None:
        mask=a
    else:
        cx,cy,rx,ry=center
        yy,xx=np.mgrid[0:FRAME,0:FRAME]
        m=np.exp(-2.1*(((xx-cx)/rx)**2+((yy-cy)/ry)**2))
        mask=Image.fromarray(np.uint8(np.clip(m*255,0,255))).filter(ImageFilter.GaussianBlur(radius/2))
        mask=Image.composite(mask,Image.new("L",(FRAME,FRAME),0),a)
    blur=mask.filter(ImageFilter.GaussianBlur(radius))
    glow=Image.new("RGBA",(FRAME,FRAME),(*accent,0)); glow.putalpha(blur.point(lambda v:int(v*amount)))
    out=Image.alpha_composite(glow,im)
    if ring and center:
        d=ImageDraw.Draw(out,"RGBA"); cx,cy,rx,ry=center
        for k in range(2):
            pad=k*9
            d.ellipse((cx-rx*.58-pad,cy-ry*.35-pad,cx+rx*.58+pad,cy+ry*.35+pad),outline=(*accent,int(90/(k+1))),width=2)
    return np.asarray(out)

def tint_flash(arr, color, strength):
    im=Image.fromarray(arr,"RGBA")
    overlay=Image.new("RGBA",im.size,(*color,0)); overlay.putalpha(im.getchannel("A").point(lambda v:int(v*strength)))
    return np.asarray(Image.alpha_composite(im,overlay))

def dissolve_death(arr, p, accent):
    im=Image.fromarray(arr,"RGBA")
    # Darken progressively while preserving local warp silhouette.
    rgb=ImageEnhance.Brightness(im).enhance(max(.36,1-p*.54))
    a=np.array(rgb.getchannel("A"),dtype=np.uint8)
    if p>0.48:
        yy,xx=np.mgrid[0:FRAME,0:FRAME]
        noise=((xx*37 + yy*61 + (xx*yy)%97) % 255).astype(np.uint8)
        threshold=int((p-.48)/.52*210)
        a=np.where(noise<threshold,0,a).astype(np.uint8)
    rgb.putalpha(Image.fromarray(a))
    if p>.18:
        rgb=Image.fromarray(add_glow(np.asarray(rgb),accent,amount=.12+.12*p,radius=6))
    return np.asarray(rgb)

def boss_ops(name,state,p):
    # p in [0,1]. Coordinates are tied to the normalized 384px canvas.
    cyc=math.sin(p*math.tau)
    beat=math.sin(p*math.pi)
    ops=[]
    if name=="colossus":
        # abdomen + large jumping femora + wing base
        if state=="idle":
            ops += [("scale",205,175,90,86,.018*cyc,-.022*cyc),("rotate",303,226,92,145,.030*cyc),("rotate",86,248,85,130,-.020*cyc),("rotate",225,105,110,80,.018*cyc)]
        elif state=="attack":
            prep=math.sin(min(1,p*1.25)*math.pi)
            release=max(0,(p-.45)/.55)
            ops += [("scale",205,184,100,98,.045*prep,-.13*prep+.08*release),("rotate",303,235,98,150,-.12*prep+.18*release),("rotate",82,246,92,140,.075*prep-.11*release),("translate",210,155,110,100,-4*release,-8*release),("rotate",223,105,118,78,.045*release)]
        elif state=="hurt":
            s=math.sin(p*math.pi); ops += [("shear",190,188,120,120,.055*s,-.025*s),("rotate",305,235,95,150,.09*s),("translate",116,204,105,110,-7*s,3*s)]
        elif state=="phase":
            ops += [("scale",207,176,105,94,.075*beat,.055*beat),("rotate",303,235,100,150,.12*cyc),("rotate",84,245,90,145,-.10*cyc),("rotate",225,106,120,85,.07*cyc)]
        else:
            ops += [("rotate",303,240,105,155,-.30*p),("rotate",82,247,100,150,.25*p),("scale",205,177,105,98,-.12*p,-.18*p),("rotate",225,105,120,85,.18*p),("translate",194,188,145,150,0,18*p)]
    elif name=="sanguina":
        if state=="idle":
            ops += [("scale",196,104,70,92,.045*cyc,.028*cyc),("translate",191,263,42,112,0,5*cyc),("rotate",94,112,104,72,.032*cyc),("rotate",292,112,104,72,-.028*cyc),("rotate",73,254,95,126,.025*cyc),("rotate",310,254,95,126,-.022*cyc)]
        elif state=="attack":
            ext=math.sin(p*math.pi); ops += [("scale",196,105,74,96,.10*ext,.075*ext),("translate",192,271,40,118,0,18*ext),("scale",192,274,36,120,-.04*ext,.13*ext),("rotate",92,113,108,78,.09*ext),("rotate",294,113,108,78,-.09*ext),("rotate",74,252,100,130,-.045*ext),("rotate",312,252,100,130,.045*ext)]
        elif state=="hurt":
            s=math.sin(p*math.pi); ops += [("translate",194,123,95,120,7*s,3*s),("rotate",93,115,110,85,-.11*s),("rotate",292,116,110,85,.06*s),("translate",192,273,42,120,-5*s,-8*s)]
        elif state=="phase":
            ops += [("scale",196,106,78,100,.13*beat,.11*beat),("rotate",93,113,110,82,.13*cyc),("rotate",292,113,110,82,-.13*cyc),("translate",191,272,45,120,0,9*cyc),("rotate",72,252,100,135,.07*cyc),("rotate",312,252,100,135,-.07*cyc)]
        else:
            ops += [("scale",196,107,80,104,-.17*p,-.22*p),("rotate",93,112,112,86,-.28*p),("rotate",292,112,112,86,.26*p),("rotate",72,253,105,140,.24*p),("rotate",312,253,105,140,-.24*p),("translate",192,273,45,120,0,-10*p)]
    elif name=="architect":
        if state=="idle":
            ops += [("scale",194,115,84,104,.024*cyc,.030*cyc),("translate",88,178,90,128,-3*cyc,0),("translate",300,178,90,128,3*cyc,0),("rotate",194,286,82,82,.018*cyc)]
        elif state=="attack":
            ex=math.sin(p*math.pi); ops += [("scale",194,116,88,108,.075*ex,.09*ex),("translate",87,180,96,135,-18*ex,0),("translate",301,180,96,135,18*ex,0),("rotate",194,285,88,86,.095*ex),("scale",194,286,92,72,.08*ex,-.055*ex),("translate",137,62,54,68,-5*ex,-10*ex),("translate",252,62,54,68,5*ex,-10*ex)]
        elif state=="hurt":
            s=math.sin(p*math.pi); ops += [("shear",194,188,150,155,.045*s,.02*s),("translate",88,180,95,135,10*s,3*s),("translate",301,180,95,135,-7*s,-2*s),("rotate",194,286,90,86,-.08*s)]
        elif state=="phase":
            ops += [("scale",194,115,92,112,.13*beat,.12*beat),("translate",88,180,100,140,-22*beat,2*cyc),("translate",300,180,100,140,22*beat,-2*cyc),("translate",137,62,58,72,-9*beat,-15*beat),("translate",252,62,58,72,9*beat,-15*beat),("scale",194,286,94,76,.11*beat,.05*beat)]
        else:
            ops += [("scale",194,116,94,116,-.18*p,-.20*p),("translate",88,181,100,145,18*p,15*p),("translate",300,181,100,145,-18*p,15*p),("rotate",194,286,96,90,.21*p),("translate",137,62,60,74,7*p,21*p),("translate",252,62,60,74,-7*p,21*p)]
    elif name=="auralis":
        if state=="idle":
            ops += [("rotate",84,77,116,84,.055*cyc),("rotate",88,151,108,78,-.045*cyc),("rotate",296,181,112,82,.048*cyc),("rotate",267,271,112,88,-.058*cyc),("translate",246,105,128,90,4*cyc,-3*cyc),("rotate",128,240,86,78,.018*cyc)]
        elif state=="attack":
            b=math.sin(p*math.pi); snap=math.sin(min(1,p*1.55)*math.pi); ops += [("rotate",84,77,118,88,.15*snap),("rotate",88,151,110,82,-.13*snap),("rotate",296,181,114,86,-.14*snap),("rotate",267,271,114,92,.16*snap),("translate",248,105,132,92,15*b,-10*b),("rotate",128,240,90,82,-.10*b),("shear",188,184,150,150,-.035*b,.045*b)]
        elif state=="hurt":
            s=math.sin(p*math.pi); ops += [("rotate",84,77,118,88,-.14*s),("rotate",296,181,116,88,.11*s),("translate",160,207,150,140,-9*s,7*s),("translate",252,104,130,92,-7*s,7*s)]
        elif state=="phase":
            ops += [("rotate",84,77,120,90,.19*cyc),("rotate",88,151,112,84,-.17*cyc),("rotate",296,181,118,90,-.18*cyc),("rotate",267,271,118,94,.20*cyc),("translate",249,104,134,94,18*beat,-12*beat),("scale",164,195,125,120,.055*beat,.035*beat)]
        else:
            ops += [("rotate",84,77,122,92,-.33*p),("rotate",88,151,114,86,.27*p),("rotate",296,181,120,92,.31*p),("rotate",267,271,120,96,-.34*p),("translate",249,105,136,96,-13*p,22*p),("rotate",128,240,92,84,.22*p)]
    elif name=="resonator":
        if state=="idle":
            ops += [("scale",194,105,75,96,.045*cyc,.055*cyc),("rotate",88,116,112,100,.028*cyc),("rotate",300,116,112,100,-.028*cyc),("scale",194,227,102,90,.018*cyc,.012*cyc)]
        elif state=="attack":
            ex=math.sin(p*math.pi); ops += [("scale",194,104,82,104,.16*ex,.14*ex),("rotate",88,116,116,104,.10*ex),("rotate",300,116,116,104,-.10*ex),("scale",194,227,106,94,.075*ex,.055*ex),("translate",194,142,86,112,0,-9*ex)]
        elif state=="hurt":
            s=math.sin(p*math.pi); ops += [("scale",194,105,82,104,-.08*s,-.10*s),("rotate",88,116,116,104,-.08*s),("rotate",300,116,116,104,.06*s),("translate",194,226,108,96,6*s,4*s)]
        elif state=="phase":
            ops += [("scale",194,104,84,108,.19*beat,.17*beat),("rotate",88,116,118,106,.14*cyc),("rotate",300,116,118,106,-.14*cyc),("scale",194,227,110,98,.10*beat,.08*beat),("translate",194,142,90,116,0,-13*beat)]
        else:
            ops += [("scale",194,105,86,110,-.22*p,-.25*p),("rotate",88,116,120,108,-.28*p),("rotate",300,116,120,108,.28*p),("scale",194,227,112,100,-.10*p,-.14*p),("translate",194,142,92,118,0,18*p)]
    return ops

def state_fx(name,state,p,arr,accent):
    if state=="hurt":
        arr=tint_flash(arr,(255,70,70),.12+.18*math.sin(p*math.pi))
    elif state=="attack":
        centers={
            "colossus":(205,180,85,78),"sanguina":(192,270,38,95),"architect":(194,284,92,65),"auralis":(130,238,72,62),"resonator":(194,108,82,104)}
        arr=add_glow(arr,accent,.18+.18*math.sin(p*math.pi),8,centers[name],ring=name=="resonator")
    elif state=="phase":
        centers={
            "colossus":(205,177,105,95),"sanguina":(196,108,80,104),"architect":(194,118,96,116),"auralis":(188,185,150,145),"resonator":(194,107,92,112)}
        arr=add_glow(arr,accent,.24+.22*math.sin(p*math.pi),11,centers[name],ring=name in {"resonator","architect"})
    elif state=="death":
        arr=dissolve_death(arr,p,accent)
    return arr

def make_sheet(name,base,state,n,accent):
    rows=math.ceil(n/COLS)
    sheet=Image.new("RGBA",(FRAME*COLS,FRAME*rows),(0,0,0,0))
    for i in range(n):
        p=0 if n<=1 else i/(n-1)
        # idle loops cleanly: distribute over [0,1)
        if state=="idle": p=i/n
        arr=remap_local(base,boss_ops(name,state,p))
        arr=state_fx(name,state,p,arr,accent)
        sheet.alpha_composite(Image.fromarray(arr,"RGBA"),((i%COLS)*FRAME,(i//COLS)*FRAME))
    return sheet

def main():
    for name,cfg in BOSSES.items():
        src=SRC/cfg["file"]
        if not src.exists(): raise SystemExit(f"Missing source: {src}")
        base=fit_rgba(src)
        out=OUT/name; out.mkdir(parents=True,exist_ok=True)
        for state,n in STATES.items():
            sheet=make_sheet(name,base,state,n,cfg["accent"])
            sheet.save(out/f"{state}.png",optimize=True)
        # preview is intentionally regenerated from the final source, not reused.
        prev=Image.fromarray(base,"RGBA")
        bg=Image.new("RGB",(FRAME,FRAME),(8,11,18)); bg.paste(prev,(0,0),prev)
        bg.save(out/"preview_v2137.jpg",quality=90,optimize=True)
        meta={
            "key":name,"frameW":FRAME,"frameH":FRAME,"revision":"2.13.7",
            "source":f"assets/boss_final_v2137/{cfg['file']}","identity":cfg["identity"],
            "animation":"localized-non-rigid-anatomical-warp",
            "states":{s:{"frames":n,"cols":COLS} for s,n in STATES.items()}
        }
        (out/"meta.json").write_text(json.dumps(meta,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(name,"done")

if __name__=="__main__": main()
