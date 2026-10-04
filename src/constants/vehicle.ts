export const CAR_BODY_TYPES = [
  "SUV",
  "Compact SUV",
  "Mid-Size SUV",
  "Full-Size SUV",
  "SUV Coupe",
  "Off-Roader (4x4)",
  "Sedan",
  "Hatchback",
  "MUV / MPV",
  "Station Wagon",
  "Coupe",
  "Convertible",
  "Pickup Truck",
] as const;

export type CarBodyType = (typeof CAR_BODY_TYPES)[number];

export const BIKE_BODY_TYPES = [
  "Commuter",
  "Cruiser",
  "Sport",
  "Adventure / Tourer",
  "Scooter",
  "Café Racer",
] as const;

export type BikeBodyType = (typeof BIKE_BODY_TYPES)[number];
