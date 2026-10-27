import sys
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8")
for p in sys.argv[1:]:
    segs,_ = m.transcribe(p, language="en", beam_size=5)
    print(p, "|", " ".join(s.text for s in segs))
