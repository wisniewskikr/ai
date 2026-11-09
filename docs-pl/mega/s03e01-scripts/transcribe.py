import sys
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    print("==", f)
    segs, _ = m.transcribe(f, word_timestamps=False, vad_filter=False)
    for s in segs:
        print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
