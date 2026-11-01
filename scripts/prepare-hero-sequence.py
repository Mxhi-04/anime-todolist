"""Extract the saved Flow/Veo interval. Activation requires an explicit review flag."""
import argparse,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('video',type=Path);p.add_argument('--activate-reviewed',action='store_true',help='Only after reviewing identity, cuts, and the first/last frames.');args=p.parse_args()
if not args.video.is_file():p.error('The exported Flow video file does not exist.')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(args.video)]))
if float(info['format']['duration'])<7.95:p.error('Expected a full eight-second source. Keep the existing poster until a complete export is available.')
dest=ROOT/'public/frames';dest.mkdir(parents=True,exist_ok=True)
if list(dest.glob('frame_*.jpg')):p.error('Frames already exist. Inspect them before replacing the current sequence.')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss','1','-i',str(args.video),'-t','7','-vf','fps=30,scale=1920:-2','-q:v','2',str(dest/'frame_%04d.jpg')],check=True)
frames=sorted(dest.glob('frame_*.jpg'))
if len(frames)<209:raise RuntimeError('The export produced fewer than 209 frames; do not activate it.')
config_path=ROOT/'src/data/hero-sequence.json';config=json.loads(config_path.read_text());config.update(ready=args.activate_reviewed,count=len(frames));config_path.write_text(json.dumps(config,indent=2)+'\n')
print(json.dumps({'frames':len(frames),'bytes':sum(f.stat().st_size for f in frames),'active':args.activate_reviewed,'review':'Inspect intermediate frames and real desktop scrubbing before activation.'}))
