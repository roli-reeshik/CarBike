/**
 * Planning estimates for Indian retail quotes.
 * Road-tax slabs and IRDAI third-party amounts follow commonly published
 * bands. They are not a tax invoice or an insurer's quote.
 */

export type FuelClass = "petrol" | "diesel" | "cng" | "electric";
export type VehicleClass = "car" | "bike";
export type InsuranceCover = "third_party" | "comprehensive";

export const TCS_THRESHOLD = 1_000_000;
export const TCS_RATE = 0.01;
export const INSURANCE_GST = 0.18;
export const IDV_FACTOR = 0.95;

const OWN_DAMAGE_RATE: Record<VehicleClass, number> = {
  car: 0.0215,
  bike: 0.018,
};

type RtoSlab = { upTo: number | null; rate: number };

type StateRoadTax = {
  id: string;
  name: string;
  car: Record<FuelClass, RtoSlab[]>;
  bike: RtoSlab[];
};

const flat = (rate: number): RtoSlab[] => [{ upTo: null, rate }];

const delhiPetrol: RtoSlab[] = [
  { upTo: 600_000, rate: 0.04 },
  { upTo: 1_000_000, rate: 0.07 },
  { upTo: null, rate: 0.1 },
];

const karnatakaPetrol: RtoSlab[] = [
  { upTo: 500_000, rate: 0.13 },
  { upTo: 1_000_000, rate: 0.14 },
  { upTo: 2_000_000, rate: 0.17 },
  { upTo: null, rate: 0.18 },
];

const karnatakaDiesel: RtoSlab[] = [
  { upTo: 500_000, rate: 0.15 },
  { upTo: 1_000_000, rate: 0.16 },
  { upTo: 2_000_000, rate: 0.19 },
  { upTo: null, rate: 0.2 },
];

export const ROAD_TAX_STATES: StateRoadTax[] = [
  {
    id: "DL",
    name: "Delhi",
    car: {
      petrol: delhiPetrol,
      cng: delhiPetrol,
      diesel: [
        { upTo: 600_000, rate: 0.05 },
        { upTo: 1_000_000, rate: 0.09 },
        { upTo: null, rate: 0.125 },
      ],
      electric: flat(0),
    },
    bike: flat(0.04),
  },
  {
    id: "MH",
    name: "Maharashtra",
    car: {
      petrol: flat(0.11),
      diesel: flat(0.13),
      cng: flat(0.07),
      electric: flat(0.05),
    },
    bike: flat(0.1),
  },
  {
    id: "KA",
    name: "Karnataka",
    car: {
      petrol: karnatakaPetrol,
      cng: karnatakaPetrol,
      diesel: karnatakaDiesel,
      electric: flat(0.04),
    },
    bike: [
      { upTo: 150_000, rate: 0.1 },
      { upTo: null, rate: 0.12 },
    ],
  },
  {
    id: "UP",
    name: "Uttar Pradesh",
    car: {
      petrol: flat(0.08),
      diesel: flat(0.1),
      cng: flat(0.08),
      electric: flat(0),
    },
    bike: flat(0.08),
  },
  {
    id: "TN",
    name: "Tamil Nadu",
    car: {
      petrol: flat(0.1),
      diesel: flat(0.12),
      cng: flat(0.08),
      electric: flat(0),
    },
    bike: flat(0.08),
  },
  {
    id: "TS",
    name: "Telangana",
    car: {
      petrol: flat(0.12),
      diesel: flat(0.14),
      cng: flat(0.1),
      electric: flat(0),
    },
    bike: flat(0.09),
  },
  {
    id: "GJ",
    name: "Gujarat",
    car: {
      petrol: flat(0.06),
      diesel: flat(0.08),
      cng: flat(0.06),
      electric: flat(0),
    },
    bike: flat(0.06),
  },
  {
    id: "RJ",
    name: "Rajasthan",
    car: {
      petrol: flat(0.09),
      diesel: flat(0.11),
      cng: flat(0.08),
      electric: flat(0),
    },
    bike: flat(0.08),
  },
  {
    id: "KL",
    name: "Kerala",
    car: {
      petrol: [
        { upTo: 1_000_000, rate: 0.13 },
        { upTo: 2_000_000, rate: 0.16 },
        { upTo: null, rate: 0.21 },
      ],
      diesel: [
        { upTo: 1_000_000, rate: 0.15 },
        { upTo: 2_000_000, rate: 0.18 },
        { upTo: null, rate: 0.21 },
      ],
      cng: flat(0.1),
      electric: flat(0.05),
    },
    bike: flat(0.12),
  },
  {
    id: "WB",
    name: "West Bengal",
    car: {
      petrol: flat(0.06),
      diesel: flat(0.08),
      cng: flat(0.06),
      electric: flat(0),
    },
    bike: flat(0.06),
  },
];

export const ENGINE_BANDS: Record<
  VehicleClass,
  { id: string; label: string; cc: number }[]
> = {
  car: [
    { id: "car-1000", label: "Up to 1,000 cc", cc: 1000 },
    { id: "car-1500", label: "1,001–1,500 cc", cc: 1500 },
    { id: "car-1500-plus", label: "Above 1,500 cc", cc: 1600 },
  ],
  bike: [
    { id: "bike-75", label: "Up to 75 cc", cc: 75 },
    { id: "bike-150", label: "76–150 cc", cc: 150 },
    { id: "bike-350", label: "151–350 cc", cc: 350 },
    { id: "bike-350-plus", label: "Above 350 cc", cc: 351 },
  ],
};

export type OnRoadQuote = {
  exShowroom: number;
  stateName: string;
  rtoRate: number;
  rto: number;
  idv: number;
  thirdParty: number;
  ownDamage: number;
  premiumBeforeGst: number;
  gst: number;
  insurance: number;
  tcsRate: number;
  tcs: number;
  onRoad: number;
};

export function thirdPartyPremium(vehicleClass: VehicleClass, engineCc: number) {
  if (vehicleClass === "car") {
    if (engineCc <= 1000) return 2094;
    if (engineCc <= 1500) return 3416;
    return 7897;
  }
  if (engineCc <= 75) return 538;
  if (engineCc <= 150) return 714;
  if (engineCc <= 350) return 1366;
  return 2804;
}

export function estimateOnRoad(input: {
  exShowroom: number;
  stateId: string;
  fuel: FuelClass;
  vehicleClass: VehicleClass;
  engineCc: number;
  cover: InsuranceCover;
}): OnRoadQuote {
  const state = ROAD_TAX_STATES.find((item) => item.id === input.stateId);
  if (!state) {
    throw new Error(`Unknown registration state: ${input.stateId}`);
  }

  const slabs =
    input.vehicleClass === "car"
      ? state.car[input.fuel]
      : input.fuel === "electric"
        ? state.car.electric
        : state.bike;
  const rtoRate = rateFor(input.exShowroom, slabs);
  const rto = rupees(input.exShowroom * rtoRate);
  const thirdParty = thirdPartyPremium(input.vehicleClass, input.engineCc);
  const idv = rupees(input.exShowroom * IDV_FACTOR);
  const ownDamage =
    input.cover === "comprehensive"
      ? rupees(idv * OWN_DAMAGE_RATE[input.vehicleClass])
      : 0;
  const premiumBeforeGst = thirdParty + ownDamage;
  const gst = rupees(premiumBeforeGst * INSURANCE_GST);
  const insurance = premiumBeforeGst + gst;
  const tcsRate = input.exShowroom > TCS_THRESHOLD ? TCS_RATE : 0;
  const tcs = rupees(input.exShowroom * tcsRate);
  const onRoad = input.exShowroom + rto + insurance + tcs;

  return {
    exShowroom: input.exShowroom,
    stateName: state.name,
    rtoRate,
    rto,
    idv,
    thirdParty,
    ownDamage,
    premiumBeforeGst,
    gst,
    insurance,
    tcsRate,
    tcs,
    onRoad,
  };
}

export type EmiMonth = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type EmiYear = {
  year: number;
  principal: number;
  interest: number;
  balance: number;
};

export type EmiQuote = {
  emi: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
  schedule: EmiMonth[];
  years: EmiYear[];
};

/** E = P · r · (1+r)^n / ((1+r)^n − 1), with r as the monthly interest rate. */
export function calculateEmi(
  principal: number,
  annualPercent: number,
  months: number,
): EmiQuote {
  if (principal <= 0 || months <= 0 || !Number.isFinite(annualPercent)) {
    throw new Error("Principal and tenure must be positive.");
  }

  const monthlyRate = annualPercent / 12 / 100;
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) /
        ((1 + monthlyRate) ** months - 1);

  const schedule: EmiMonth[] = [];
  let balance = round2(principal);

  for (let month = 1; month <= months; month += 1) {
    const interest = round2(balance * monthlyRate);
    let principalPart = round2(emi - interest);
    if (month === months || principalPart > balance) {
      principalPart = balance;
    }
    const payment = round2(principalPart + interest);
    balance = round2(Math.max(0, balance - principalPart));
    schedule.push({
      month,
      payment,
      principal: principalPart,
      interest,
      balance,
    });
  }

  const totalInterest = round2(
    schedule.reduce((sum, row) => sum + row.interest, 0),
  );
  const totalPayment = round2(principal + totalInterest);

  return {
    emi: round2(emi),
    principal: round2(principal),
    totalInterest,
    totalPayment,
    schedule,
    years: rollupYears(schedule),
  };
}

export type PowertrainCost = {
  perKm: number;
  monthly: number;
  yearly: number;
};

export type RunningCostQuote = {
  dailyKm: number;
  petrol: PowertrainCost;
  diesel: PowertrainCost;
  electric: PowertrainCost;
  cheapest: "petrol" | "diesel" | "electric";
};

export function compareRunningCost(input: {
  dailyKm: number;
  petrolPricePerLitre: number;
  petrolKmPerLitre: number;
  dieselPricePerLitre: number;
  dieselKmPerLitre: number;
  electricityPricePerKwh: number;
  evKmPerKwh: number;
}): RunningCostQuote {
  const petrol = costOf(
    input.dailyKm,
    input.petrolPricePerLitre / input.petrolKmPerLitre,
  );
  const diesel = costOf(
    input.dailyKm,
    input.dieselPricePerLitre / input.dieselKmPerLitre,
  );
  const electric = costOf(
    input.dailyKm,
    input.electricityPricePerKwh / input.evKmPerKwh,
  );
  const ranked = [
    ["petrol", petrol.perKm],
    ["diesel", diesel.perKm],
    ["electric", electric.perKm],
  ] as const;
  const cheapest = ranked.reduce((best, item) =>
    item[1] < best[1] ? item : best,
  )[0];

  return {
    dailyKm: input.dailyKm,
    petrol,
    diesel,
    electric,
    cheapest,
  };
}

function costOf(dailyKm: number, perKm: number): PowertrainCost {
  return {
    perKm: round2(perKm),
    monthly: round2(perKm * dailyKm * 30),
    yearly: round2(perKm * dailyKm * 365),
  };
}

function rateFor(amount: number, slabs: RtoSlab[]) {
  const slab =
    slabs.find((item) => item.upTo == null || amount <= item.upTo) ??
    slabs[slabs.length - 1];
  return slab.rate;
}

function rollupYears(schedule: EmiMonth[]): EmiYear[] {
  const years: EmiYear[] = [];
  for (let index = 0; index < schedule.length; index += 12) {
    const slice = schedule.slice(index, index + 12);
    const last = slice[slice.length - 1];
    years.push({
      year: years.length + 1,
      principal: round2(slice.reduce((sum, row) => sum + row.principal, 0)),
      interest: round2(slice.reduce((sum, row) => sum + row.interest, 0)),
      balance: last.balance,
    });
  }
  return years;
}

function rupees(value: number) {
  return Math.round(value);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
