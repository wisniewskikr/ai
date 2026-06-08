import CircuitBreaker from "opossum";
import { log } from "./monitor.js";
import { config } from "../config.js";

export function createLLMBreaker(fn: (...args: any[]) => Promise<any>): CircuitBreaker {
  const breaker = new CircuitBreaker(fn, {
    errorThresholdPercentage: config.circuitBreaker.failureThreshold,
    timeout: config.circuitBreaker.timeoutMs,
    resetTimeout: config.circuitBreaker.resetTimeoutMs,
  });

  breaker.on("open", () =>
    log.error({ layer: "infra", breaker: "open" }, "circuit breaker opened")
  );
  breaker.on("halfOpen", () =>
    log.warn({ layer: "infra", breaker: "half-open" }, "circuit breaker half-open")
  );
  breaker.on("close", () =>
    log.info({ layer: "infra", breaker: "closed" }, "circuit breaker closed")
  );

  return breaker;
}

export function getBreakerState(breaker: CircuitBreaker): "closed" | "open" | "half-open" {
  if (breaker.opened) return "open";
  if (breaker.halfOpen) return "half-open";
  return "closed";
}
