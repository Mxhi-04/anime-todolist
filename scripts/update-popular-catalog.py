"""Merge the browser-observed Popular 50 without removing established worlds.

The observation is account/region/date-specific, not a global official chart.
Metadata candidates were returned by AniList's public GraphQL search API.
"""
import json, unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def norm(value):
 return ''.join(c for c in unicodedata.normalize('NFKD',value.lower()) if c.isalnum())
source_path=ROOT/'docs/research/anime-catalog.json'
source=json.loads(source_path.read_text())
observed=json.loads((ROOT/'docs/research/crunchyroll-popular-observed.json').read_text())
candidates=json.loads((ROOT/'docs/research/popular-metadata-candidates.json').read_text())['data']
original_mal=[21,1735,20,813,30694,40748,38000,16498,52299,44511,31964,34572,52991,54492,50265,49596,20583,57334,52588,38691,32182,5114,37521,31240,39535,37430,35790,11757,6702,14719,22319,38671,52347,35507,48736,42897,37999,38680,47917,1,9253,1575,46569,52211,29803,59062,54900,11061,30831,24833]
for entry,mal in zip(source['entries'][:50],original_mal):entry.setdefault('idMal',mal)
new_specs=[
 ('golden-kamuy','#A98239','#435B6C','Adventure','Expeditions','Trail focus','Topographic rules and gold chapter marks'),
 ('fate-strange-fake','#456B9B','#BA633E','Supernatural','Assignments','Ritual focus','Fine constellation rules and ritual circles'),
 ('cheat-skill-another-world','#4F7A72','#A56C8E','Fantasy','Quests','Training focus','Split-world panels and restrained magic rings'),
 ('mf-ghost','#C34B3F','#456C8B','Sports','Lap goals','Practice session','Circuit lines and crisp timing marks'),
 ('trigun-stampede','#B34E40','#B18E3E','Sci-Fi','Jobs','Desert focus','Sand-tone borders and precise crosshair rules'),
 ('to-your-eternity','#698663','#A27665','Fantasy','Chapters','Quiet focus','Organic chapter lines and calm landscape margins'),
 ('beginning-after-end','#487E80','#9B7353','Fantasy','Quests','Training focus','Bound-book margins and subtle rune geometry'),
 ('tsukimichi','#566D99','#9A6495','Fantasy','Quests','Moonlit focus','Fine moon arcs and indigo chapter marks'),
 ('your-lie-in-april','#BA6B79','#5C83A0','Music','Practice goals','Practice session','Sheet-music rules and pale petal accents'),
 ('iruma-kun','#5B6FAE','#AA6295','Comedy','Assignments','Study session','Playful school notebook panels and star marks'),
 ('soul-eater','#AA6538','#67639A','Supernatural','Assignments','Resonance focus','Lunar circles and angular ink borders'),
 ('dragon-ball','#D47632','#477BA4','Adventure','Training goals','Training session','Round journey stamps and bold speed lines'),
 ('wistoria','#427B79','#9F7157','Fantasy','Quests','Study session','Fine tower geometry and grimoire rules'),
 ('ascendance-bookworm','#876B45','#5E7F9B','Fantasy','Chapters','Reading session','Library-card rules and warm book margins'),
]
by_title={norm(e['title']):e for e in source['entries']}
for i,spec in enumerate(new_specs):
 ident,primary,secondary,genre,task,focus,motif=spec
 m=candidates['q'+str(i)]['media'][0]
 title=m['title']['english'] or m['title']['romaji']
 if norm(title) in by_title:continue
 entry={'id':ident,'idMal':m['idMal'],'title':title,'editorialOrder':len(source['entries'])+1,'officialRank':None,'genres':[genre], 'catalogEvidence':{'url':None,'type':'Browser-observed Crunchyroll Popular card','checkedOn':observed['observedAt'],'locale':'Signed-in account view; no universal or India playback claim'},'designProposal':{'primary':primary,'secondary':secondary,'surface':'#FFF9ED','ink':'#191919','motif':motif,'taskLabel':task,'focusLabel':focus,'loopScene':'Cyclic camera motion around the sourced title-matched still; no regenerated character motion.'},'media':{'referenceStatus':'Title confirmed against AniList metadata','usageStatus':'Not established; creator attribution is not permission','productionReadiness':'See src/data/catalog.json and docs/implementation/media-checks.json'}}
 source['entries'].append(entry);by_title[norm(title)]=entry
for e in source['entries']:e['popularPosition']=None
for row in observed['entries']:
 entry=by_title.get(norm(row['title']))
 if entry is None:raise RuntimeError('Missing title: '+row['title'])
 entry['popularPosition']=row['position'];entry['popularObservedOn']=observed['observedAt'];entry['catalogEvidence']['url']=row['url']
source.update(status='Implemented catalog; production asset manifest is src/data/catalog.json',rankingMethod='First 50 entries observed on Crunchyroll Popular in signed-in Chrome on 2026-11-01, plus the established major-anime selection. Position is a dated view, not an official global rank.',regionNote=observed['context'])
source['entries'].sort(key=lambda e:(e['popularPosition'] is None,e['popularPosition'] or e['editorialOrder']))
source_path.write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(source['entries']),'observedPopular':sum(e['popularPosition'] is not None for e in source['entries'])}))
