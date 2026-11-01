"""Fetch title-identified poster/scene assets through AniList's public metadata API."""
import concurrent.futures,json,subprocess,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'docs/research/anime-catalog.json').read_text())['entries']
MAL_IDS=[entry['idMal'] for entry in source]
media={}
for offset in range(0,len(MAL_IDS),50):
 ids=MAL_IDS[offset:offset+50]
 query='query { Page(perPage: 50) { media(idMal_in: '+json.dumps(ids)+', type: ANIME) { id idMal title { romaji english native } synonyms genres coverImage { extraLarge color } bannerImage siteUrl trailer { id site thumbnail } } } }'
 req=urllib.request.Request('https://graphql.anilist.co',data=json.dumps({'query':query}).encode(),headers={'Content-Type':'application/json','User-Agent':'AnimeTodo/1.0'})
 response=json.loads(urllib.request.urlopen(req,timeout=25).read())
 if response.get('errors'):raise RuntimeError(response['errors'])
 media.update({x['idMal']:x for x in response['data']['Page']['media']})
missing=[x for x in MAL_IDS if x not in media]
if missing:raise RuntimeError('Unresolved MAL IDs: '+str(missing))
lookup={}
jobs=[]
for entry,mal in zip(source,MAL_IDS):
 m=media[mal]
 print(entry['id'],'=>',m['title']['english'] or m['title']['romaji'],flush=True)
 dest=ROOT/'public/media/anime'/entry['id'];dest.mkdir(parents=True,exist_ok=True)
 for role,url in [('poster',m['coverImage']['extraLarge']),('scene',m['bannerImage'])]:
  if url:jobs.append((url,dest/(role+'.jpg')))
 lookup[entry['id']]=m
(ROOT/'docs/research/anilist-metadata.json').write_text(json.dumps({'provider':'AniList public GraphQL','endpoint':'https://graphql.anilist.co','retrievedOn':'2026-11-01','entries':lookup},ensure_ascii=False,indent=2)+'\n')
def download(job):
 url,path=job
 if path.exists() and path.stat().st_size>1000:return str(path.relative_to(ROOT)),True
 r=subprocess.run(['curl','-fLsS','--connect-timeout','7','--max-time','25',url,'-o',str(path)],capture_output=True,timeout=30)
 return str(path.relative_to(ROOT)),r.returncode==0 and path.exists() and path.stat().st_size>1000
with concurrent.futures.ThreadPoolExecutor(6) as pool:
 results=list(pool.map(download,jobs))
failed=[x[0] for x in results if not x[1]]
if failed:print('FAILED',failed,flush=True)
catalog=[]
for entry in source:
 m=lookup[entry['id']];d=entry['designProposal'];base='/media/anime/'+entry['id']
 poster=base+'/poster.jpg';scene=base+'/scene.jpg' if (ROOT/('public'+base+'/scene.jpg')).exists() else poster
 catalog.append({'id':entry['id'],'title':entry['title'],'aliases':list(dict.fromkeys([x for x in m['title'].values() if x]+m['synonyms'])),'genres':entry['genres'],'color':d['primary'],'secondary':d['secondary'],'taskLabel':d['taskLabel'],'focusLabel':d['focusLabel'],'motif':d['motif'],'poster':poster,'scene':scene,'trailer':('https://www.youtube.com/watch?v='+m['trailer']['id']) if m.get('trailer') and m['trailer']['site']=='youtube' else None,'source':m['siteUrl'],'catalogSource':entry['catalogEvidence']['url'],'native':m['title']['native'],'popularPosition':entry.get('popularPosition'),'popularObservedOn':entry.get('popularObservedOn'),'loop':base+'/ambient.mp4' if (ROOT/('public'+base+'/ambient.mp4')).exists() else None,'loopKind':'live-artwork' if (ROOT/('public'+base+'/ambient.mp4')).exists() else None})
(ROOT/'src/data/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'titles':len(catalog),'assets':len(results),'failed':failed}),flush=True)
