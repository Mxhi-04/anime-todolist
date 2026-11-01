"""Make seamless live-artwork loops from each title's sourced landscape, without regenerating characters."""
from pathlib import Path
import json,subprocess,concurrent.futures,sys
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'src/data/catalog.json'
items=json.loads(path.read_text())
def make(item):
 source=ROOT/('public'+item['scene']);output=ROOT/'public/media/anime'/item['id']/'ambient.mp4'
 if '--force' not in sys.argv and output.exists() and output.stat().st_size>1000:return item['id'],True
 vf="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='1.035+0.012*sin(2*PI*on/180)':x='iw/2-iw/zoom/2+8*sin(2*PI*on/180)':y='ih/2-ih/zoom/2+4*cos(2*PI*on/180)':d=180:s=960x540:fps=30,format=yuv420p"
 r=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(source),'-vf',vf,'-frames:v','180','-an','-c:v','libx264','-preset','veryfast','-crf','26','-threads','2','-movflags','+faststart','-y',str(output)],capture_output=True,text=True,timeout=120)
 return item['id'],r.returncode==0
with concurrent.futures.ThreadPoolExecutor(2) as pool:
 for ident,ok in pool.map(make,items):print(ident,'ready' if ok else 'FAILED',flush=True)
for item in items:
 p=ROOT/'public/media/anime'/item['id']/'ambient.mp4'
 if p.exists() and p.stat().st_size>1000:
  item['loop']='/media/anime/'+item['id']+'/ambient.mp4'
  item['loopKind']='live-artwork'
path.write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
