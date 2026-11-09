import sys, subprocess
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8")
src = sys.argv[1]
for rng in sys.argv[2:]:
    a,b = rng.split(':')
    out = f"../s03e01-work/frames/clip_{a}_{b}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",a,"-to",b,"-i",src,"-ac","1","-ar","16000",out],check=True)
    for prompt in [None, "Requirement tags are spelled letter by letter, like R-K5Z, R-L2Z, R-H9X."]:
        segs,_ = m.transcribe(out, beam_size=10, initial_prompt=prompt, word_timestamps=True)
        print(rng, "prompt" if prompt else "plain", " | ".join(f"{w.word.strip()}@{float(a)+w.start:.1f}" for s in segs for w in s.words))
