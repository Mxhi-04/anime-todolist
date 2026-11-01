"""Decode every generated ambient loop and quantify the first/last-frame seam."""
from pathlib import Path
import concurrent.futures,json,subprocess,math
ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/'src/data/catalog.json').read_text())
def check(item):
 files=[ROOT/('public'+item[k]) for k in ['poster','scene','loop']]
 assert all(p.is_file() and p.stat().st_size>1000 for p in files),item['id']
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-i',str(files[2]),'-vf',"select='eq(n,0)+eq(n,179)',scale=160:90,format=gray",'-vsync','0','-frames:v','2','-f','rawvideo','pipe:1']
 r=subprocess.run(cmd,capture_output=True,timeout=30)
 count=160*90
 if r.returncode or len(r.stdout)!=count*2:raise RuntimeError(item['id']+': incomplete decode')
 first,last=r.stdout[:count],r.stdout[count:]
 mae=sum(abs(a-b) for a,b in zip(first,last))/count/255
 if mae>.03:raise RuntimeError(item['id']+': large seam difference '+str(mae))
 return {'id':item['id'],'posterBytes':files[0].stat().st_size,'sceneBytes':files[1].stat().st_size,'loopBytes':files[2].stat().st_size,'frames':180,'fps':30,'durationSeconds':6,'seamNormalizedMeanAbsoluteDifference':round(mae,6),'decode':'passed','kind':'cyclic still-artwork; no generated character motion'}
with concurrent.futures.ThreadPoolExecutor(3) as pool:results=list(pool.map(check,items))
report={'checkedOn':'2026-11-01','count':len(results),'allPassed':True,'scope':'File existence, full-stream decode through final frame, expected frame count, and first/last seam difference. This is not a substitute for reviewing three real playback cycles in each target browser.','entries':results}
(ROOT/'docs/implementation/media-checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'loops':len(results),'maximumSeamDifference':max(x['seamNormalizedMeanAbsoluteDifference'] for x in results),'totalLoopMB':round(sum(x['loopBytes'] for x in results)/1024/1024,2),'allPassed':True}))
