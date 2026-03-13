// Coin rates per kg for different waste types
const COIN_RATES = {
  organic: 10,
  recyclable: 15,
  hazardous: 20,
  electronic: 25,
  general: 5,
  bulk: 15
};

// Calculate coins for waste collection
const calculateCoins = (wasteType, weight) => {
  const rate = COIN_RATES[wasteType] || 5;
  return Math.round(rate * weight);
};

// Calculate coins for volunteer hours
const calculateVolunteerCoins = (hours) => {
  return hours * 50; // 50 coins per hour
};

// Check free service eligibility (1000 coins)
const checkFreeServiceEligibility = (coins) => {
  return coins >= 1000;
};

// Calculate monthly fee
const calculateMonthlyFee = (zone) => {
  const baseFee = 350; // Base fee ₹350
  const zoneMultiplier = {
    north: 1,
    south: 1,
    east: 1,
    west: 1,
    central: 1.2 // Central zone has higher fee
  };
  return baseFee * (zoneMultiplier[zone] || 1);
};

// Calculate program reward coins
const calculateProgramReward = (programType, duration) => {
  const baseReward = 100;
  const typeMultiplier = {
    cleanup: 1,
    recycling: 1.2,
    education: 1,
    plantation: 1.1,
    awareness: 0.8,
    other: 1
  };
  const durationMultiplier = Math.ceil(duration / 2); // More hours = more coins
  return Math.round(baseReward * (typeMultiplier[programType] || 1) * durationMultiplier);
};

module.exports = {
  calculateCoins,
  calculateVolunteerCoins,
  checkFreeServiceEligibility,
  calculateMonthlyFee,
  calculateProgramReward,
  COIN_RATES
};