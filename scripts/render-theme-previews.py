from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, math, random

root = Path(__file__).resolve().parent.parent
projects = json.loads((root / "data/studio-projects.json").read_text("utf-8"))
fonts = Path("/usr/share/fonts/truetype/dejavu")
def font(size, bold=False):
    p = fonts / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")
    return ImageFont.truetype(str(p),size) if p.exists() else ImageFont.load_default()
def rgb(v):
    v=v.lstrip("#")
    return tuple(int(v[i:i+2],16) for i in (0,2,4))
def blend(a,b,t):
    return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
def create(project):
    slug=project["slug"]
    if project["sourceType"]=="base":
        return Image.open(root/"reference-themes"/slug/"preview.png").convert("RGB")
    colors=project["config"]["colors"]
    W,H=1920,1080
    dark,light=rgb(colors["backgroundPrimary"]),rgb(colors["backgroundSecondary"])
    a,b=rgb(colors["accentPrimary"]),rgb(colors["accentSecondary"])
    im=Image.new("RGB",(W,H),dark)
    d=ImageDraw.Draw(im)
    for y in range(H):
        t=.52*(1-y/H)**1.3
        d.line([(0,y),(W,y)],fill=blend(dark,light,t))
    if slug=="ObsidianGold":
        imgpath=root/"src/assets/images/bg_obsidian_architecture_1794859274188.jpg"
        if imgpath.exists():
            photo=Image.open(imgpath).convert("RGB").resize((W,H))
            im=Image.blend(im,photo,.24)
            d=ImageDraw.Draw(im)
        for offset in range(80,1850,160):
            d.rectangle((offset,65,offset+2,970),fill=blend(dark,a,.19))
    elif slug=="CyberHorizon":
        for x in range(-1900,3900,85):
            d.line([(x,H),(960+int((x-960)*.07),60)],fill=blend(dark,a,.2),width=2)
        for y in range(100,H,74):d.line([(0,y),(W,y)],fill=blend(dark,b,.25),width=2)
        for row in range(12):
            for col in range(22):
                x,y=col*95+(row%2)*47,row*93
                d.regular_polygon((x,y,44),6,rotation=30,outline=blend(dark,a,.24),width=2)
    else:
        for line in range(34):
            pts=[(x,int(130+line*31+math.sin(x*.009+line*.5)*24)) for x in range(0,W+20,20)]
            d.line(pts,fill=blend(dark,a if line%2 else b,.26),width=2)
    cx=960
    d.ellipse((cx-82,52,cx+82,216),outline=a,width=7)
    d.ellipse((cx-69,65,cx+69,203),fill=blend(dark,light,.8))
    initials="".join(word[0] for word in project["name"].split())
    d.text((cx,133),initials,font=font(59,True),fill=a,anchor="mm")
    d.text((cx,300),project["name"].upper(),font=font(64,True),fill=rgb(colors["titleColor"]),anchor="mm")
    d.text((cx,380),"EXEMPLO DE PÁGINA LINKSTACK",font=font(29),fill=a,anchor="mm")
    radius=project["config"]["buttons"]["borderRadiusPx"]
    for i,label in enumerate(["Portfólio digital","Meus projetos","Redes sociais","Contato"]):
        y=427+i*133
        d.rounded_rectangle((cx-440,y,cx+440,y+94),radius=radius,
            fill=rgb(colors["buttonBg"]),outline=a if i%2==0 else b,width=4)
        d.text((cx,y+47),label,font=font(35,True),fill=rgb(colors["buttonText"]),anchor="mm")
    d.text((cx,1030),"Miniatura ilustrativa baseada nas configurações de cores, tipografia e botões",font=font(22),fill=rgb(colors["descriptionColor"]),anchor="mm")
    return im

for p in projects:
    slug=p["slug"]
    if slug not in ("PolySleek","galaxy","CyberHorizon","ObsidianGold","HoloPrism"):continue
    image=create(p)
    tmp=root/".theme-build/previews"/slug
    tmp.mkdir(parents=True,exist_ok=True)
    image.save(tmp/"preview.png",optimize=True)
    folder=root/"Free"/slug
    folder.mkdir(parents=True,exist_ok=True)
    image.resize((960,540),Image.Resampling.LANCZOS).save(folder/"thumbnail.png",optimize=True)
    print("Miniatura:",slug)
