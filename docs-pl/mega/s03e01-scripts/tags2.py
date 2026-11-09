import sys, subprocess
from faster_whisper import WhisperModel
models = {n: WhisperModel(n, device="cpu", compute_type="int8") for n in ["medium.en","base"]}
src = sys.argv[1]
for rng in sys.argv[2:]:
    a,b = rng.split(':')
    for tempo in ["1.0","0.7"]:
        out = f"../s03e01-work/frames/t_{a}_{tempo}.wav"
        subprocess.run(["ffmpeg","-v","error","-y","-ss",a,"-to",b,"-i",src,"-af",f"atempo={tempo}","-ac","1","-ar","16000",out],check=True)
        for n,m in models.items():
            segs,_ = m.transcribe(out, beam_size=10, language="en", initial_prompt="Letters and digits spelled out: R dash K 5 Z.")
            print(rng, tempo, n, "|", " ".join(s.text.strip() for s in segs))
