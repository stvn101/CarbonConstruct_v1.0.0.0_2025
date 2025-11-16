import { PresetOption } from "@/components/ui/number-input-with-presets";

// Operating hours presets for construction equipment
export const operatingHoursPresets: PresetOption[] = [
  { value: 8, label: "8 hours", description: "Standard single shift" },
  { value: 16, label: "16 hours", description: "Double shift" },
  { value: 24, label: "24 hours", description: "Continuous operation" },
  { value: 40, label: "40 hours", description: "Standard work week" },
  { value: 168, label: "168 hours", description: "Full week continuous" },
  { value: 730, label: "730 hours", description: "Average month" },
];

// Fuel quantity presets (liters)
export const fuelQuantityPresets: PresetOption[] = [
  { value: 20, label: "20 L", description: "Small generator tank" },
  { value: 50, label: "50 L", description: "Standard equipment tank" },
  { value: 100, label: "100 L", description: "Large equipment tank" },
  { value: 200, label: "200 L", description: "Fuel drum" },
  { value: 500, label: "500 L", description: "Small fuel tank" },
  { value: 1000, label: "1000 L", description: "IBC container" },
  { value: 5000, label: "5000 L", description: "Bulk fuel storage" },
];

// Distance presets (kilometers)
export const distancePresets: PresetOption[] = [
  { value: 10, label: "10 km", description: "Local delivery" },
  { value: 50, label: "50 km", description: "Urban radius" },
  { value: 100, label: "100 km", description: "Regional delivery" },
  { value: 250, label: "250 km", description: "Interstate short" },
  { value: 500, label: "500 km", description: "Interstate medium" },
  { value: 1000, label: "1000 km", description: "Interstate long" },
  { value: 2000, label: "2000 km", description: "Cross-country" },
];

// Fuel consumption presets (L/100km)
export const fuelConsumptionPresets: PresetOption[] = [
  { value: 7, label: "7 L/100km", description: "Light vehicle efficient" },
  { value: 10, label: "10 L/100km", description: "Light vehicle standard" },
  { value: 15, label: "15 L/100km", description: "Medium truck" },
  { value: 25, label: "25 L/100km", description: "Heavy truck" },
  { value: 35, label: "35 L/100km", description: "Heavy truck loaded" },
  { value: 50, label: "50 L/100km", description: "Semi-trailer" },
];

// Electricity quantity presets (kWh)
export const electricityQuantityPresets: PresetOption[] = [
  { value: 100, label: "100 kWh", description: "Small site office daily" },
  { value: 500, label: "500 kWh", description: "Medium site daily" },
  { value: 1000, label: "1000 kWh", description: "Large site daily" },
  { value: 5000, label: "5000 kWh", description: "Small site monthly" },
  { value: 15000, label: "15000 kWh", description: "Medium site monthly" },
  { value: 30000, label: "30000 kWh", description: "Large site monthly" },
  { value: 100000, label: "100000 kWh", description: "Major project monthly" },
];

// Green power percentage presets
export const greenPowerPresets: PresetOption[] = [
  { value: 0, label: "0%", description: "No renewable energy" },
  { value: 10, label: "10%", description: "Accredited GreenPower" },
  { value: 20, label: "20%", description: "Basic renewable mix" },
  { value: 50, label: "50%", description: "50% renewable target" },
  { value: 75, label: "75%", description: "High renewable mix" },
  { value: 100, label: "100%", description: "Fully renewable" },
];

// HVAC efficiency rating presets (SEER or EER)
export const efficiencyRatingPresets: PresetOption[] = [
  { value: 2.5, label: "2.5", description: "Basic portable AC" },
  { value: 3.0, label: "3.0", description: "Standard split system" },
  { value: 3.5, label: "3.5", description: "Good efficiency" },
  { value: 4.0, label: "4.0", description: "High efficiency" },
  { value: 5.0, label: "5.0", description: "Very high efficiency" },
  { value: 6.0, label: "6.0", description: "Premium efficiency" },
];

// Material quantity presets (tonnes)
export const materialQuantityPresets: PresetOption[] = [
  { value: 1, label: "1 tonne", description: "Small quantity" },
  { value: 5, label: "5 tonnes", description: "Medium quantity" },
  { value: 10, label: "10 tonnes", description: "Large quantity" },
  { value: 50, label: "50 tonnes", description: "Bulk order" },
  { value: 100, label: "100 tonnes", description: "Major delivery" },
  { value: 500, label: "500 tonnes", description: "Large project supply" },
  { value: 1000, label: "1000 tonnes", description: "Major project supply" },
];

// Refrigerant leak quantity presets (kg)
export const refrigerantQuantityPresets: PresetOption[] = [
  { value: 0.5, label: "0.5 kg", description: "Small leak/top-up" },
  { value: 1, label: "1 kg", description: "Minor refrigerant loss" },
  { value: 2, label: "2 kg", description: "Moderate leak" },
  { value: 5, label: "5 kg", description: "Significant leak" },
  { value: 10, label: "10 kg", description: "Major leak/recharge" },
  { value: 20, label: "20 kg", description: "Large system recharge" },
];

// GWP factor presets for common refrigerants
export const gwpFactorPresets: PresetOption[] = [
  { value: 1, label: "1 (CO2)", description: "Carbon Dioxide" },
  { value: 675, label: "675 (R-32)", description: "Difluoromethane" },
  { value: 1430, label: "1430 (R-134a)", description: "Tetrafluoroethane" },
  { value: 2088, label: "2088 (R-404A)", description: "Common blend" },
  { value: 3985, label: "3985 (R-410A)", description: "Common AC refrigerant" },
  { value: 14800, label: "14800 (R-23)", description: "Trifluoromethane" },
];

// Emission factor presets (kg CO2e per unit)
export const emissionFactorPresets: PresetOption[] = [
  { value: 0.1, label: "0.1", description: "Very low carbon" },
  { value: 0.5, label: "0.5", description: "Low carbon" },
  { value: 1.0, label: "1.0", description: "Moderate carbon" },
  { value: 2.5, label: "2.5", description: "High carbon" },
  { value: 5.0, label: "5.0", description: "Very high carbon" },
  { value: 10.0, label: "10.0", description: "Extremely high carbon" },
];

// Concrete volume presets (cubic meters)
export const concreteVolumePresets: PresetOption[] = [
  { value: 1, label: "1 m³", description: "Small pour" },
  { value: 5, label: "5 m³", description: "Medium pour" },
  { value: 10, label: "10 m³", description: "Standard truck" },
  { value: 20, label: "20 m³", description: "Large pour" },
  { value: 50, label: "50 m³", description: "Major slab" },
  { value: 100, label: "100 m³", description: "Foundation pour" },
  { value: 500, label: "500 m³", description: "Major structure" },
];

// Steel quantity presets (tonnes)
export const steelQuantityPresets: PresetOption[] = [
  { value: 0.5, label: "0.5 tonne", description: "Small rebar delivery" },
  { value: 1, label: "1 tonne", description: "Standard rebar" },
  { value: 5, label: "5 tonnes", description: "Medium structural" },
  { value: 10, label: "10 tonnes", description: "Large structural" },
  { value: 50, label: "50 tonnes", description: "Major frame component" },
  { value: 100, label: "100 tonnes", description: "Building frame" },
];

// Transport weight presets (tonnes)
export const transportWeightPresets: PresetOption[] = [
  { value: 1, label: "1 tonne", description: "Light van load" },
  { value: 3, label: "3 tonnes", description: "Small truck load" },
  { value: 8, label: "8 tonnes", description: "Medium rigid truck" },
  { value: 15, label: "15 tonnes", description: "Large rigid truck" },
  { value: 25, label: "25 tonnes", description: "Semi-trailer load" },
  { value: 40, label: "40 tonnes", description: "B-double load" },
];
