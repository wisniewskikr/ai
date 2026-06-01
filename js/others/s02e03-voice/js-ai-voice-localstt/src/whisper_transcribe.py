import sys
from faster_whisper import WhisperModel

model_size = sys.argv[1]
audio_path = sys.argv[2]

model = WhisperModel(model_size, device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio_path)

for segment in segments:
    print(segment.text, end="", flush=True)
