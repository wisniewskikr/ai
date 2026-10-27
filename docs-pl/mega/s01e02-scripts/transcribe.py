import sys, json
from faster_whisper import WhisperModel
model_name, path, out = sys.argv[1], sys.argv[2], sys.argv[3]
m = WhisperModel(model_name, device="cpu", compute_type="int8")
segs, info = m.transcribe(path, word_timestamps=True, language="en", beam_size=5, vad_filter=False)
res = []
for s in segs:
    res.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [[w.start, w.end, w.word] for w in s.words]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
json.dump(res, open(out, "w", encoding="utf-8"), indent=1)
