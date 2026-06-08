export type SimMode = "none" | "retry" | "canary" | "breaker";

let mode: SimMode = "none";

export function setSimMode(m: SimMode) {
  mode = m;
}

export function getSimMode(): SimMode {
  return mode;
}

// Returns true when the simulated API call should throw a 500 error
export function shouldSimulateFail(): boolean {
  return mode === "retry" || mode === "breaker";
}

// Returns true when the canary check should report failure
export function shouldReturnInvalidCanary(): boolean {
  return mode === "canary";
}
