// Mock weather data — replace with a real API (e.g. Open-Meteo) when ready.
const WEATHER_DATA: Record<string, string> = {
  warsaw: "Sunny, 22°C, humidity 45%, wind 10 km/h from the west.",
  krakow: "Partly cloudy, 19°C, humidity 60%, wind 8 km/h from the south.",
  gdansk: "Overcast with light rain, 16°C, humidity 82%, wind 20 km/h from the north.",
  wroclaw: "Clear skies, 24°C, humidity 40%, wind 5 km/h.",
  poznan: "Mostly sunny, 21°C, humidity 50%, wind 12 km/h.",
  lodz: "Cloudy, 18°C, humidity 65%, wind 14 km/h.",
  london: "Cloudy with drizzle, 14°C, humidity 78%, wind 25 km/h.",
  berlin: "Sunny, 20°C, humidity 55%, wind 15 km/h.",
  paris: "Partly sunny, 23°C, humidity 48%, wind 10 km/h.",
  new_york: "Clear, 28°C, humidity 35%, wind 18 km/h.",
  tokyo: "Humid and warm, 31°C, humidity 72%, wind 8 km/h.",
};

export function checkWeather(city: string): string {
  const key = city.toLowerCase().replace(/\s+/g, "_");
  const conditions = WEATHER_DATA[key] ?? `Sunny, 18°C, humidity 55%, wind 10 km/h. (mock data)`;
  return `Weather in ${city}: ${conditions}`;
}
