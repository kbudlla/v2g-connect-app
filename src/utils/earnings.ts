// Used to calculate pricing based on charged/discharged KWh, somewhat based in reality
import { ChargingReceipt } from './simulation';

// https://www.umschalten.de/en/ladekarten-im-vergleich/
// [...document.querySelectorAll('tbody > tr > :nth-child(2)')].map(e => e.textContent.trim())
const pricesPerKWh = [0.6, 0.6, 0.5, 0.45, 0.54, 0.65, 0.57, 0.5, 0.42, 0.59, 0.59, 0.5, 0.49, 0.39, 0.56, 0.59, 0.55];

// How much a user gets per KWh discharged in relation to a KWh charged, play around with this to get better numbers
const v2gParticipationScale = 1.1;

export const generateReceipt = (
  receipt: Omit<ChargingReceipt, 'totalCost' | 'chargingCost' | 'earnings'>,
): ChargingReceipt => {
  const pricePerKWh = pricesPerKWh[Math.floor(Math.random() * pricesPerKWh.length)];

  const chargingCost = receipt.chargedKWh * pricePerKWh;
  const earnings = receipt.dischargedKWh * pricePerKWh * v2gParticipationScale;

  const totalCost = chargingCost - earnings;
  return {
    chargedKWh: Math.max(0, receipt.chargedKWh - receipt.dischargedKWh),
    dischargedKWh: receipt.dischargedKWh,
    location: receipt.location,
    timestamp: receipt.timestamp,
    chargingCost,
    earnings,
    totalCost,
  };
};
