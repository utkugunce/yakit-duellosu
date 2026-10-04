import { DailyLog, FuelPurchaseRecord, CarSettings } from '../types';

export const DEFAULT_CAR_SETTINGS: CarSettings = {
  carName: 'Bizim Araba',
  plate: '34 GZ 1024',
  fuelType: 'benzin',
  tankCapacity: 45,
  currentFuelPrice: 44.90,
  activeDriver: 'utku',
  syncEnabled: false
};

export const INITIAL_MOCK_TRIPS: DailyLog[] = [];

export const INITIAL_MOCK_REFUELS: FuelPurchaseRecord[] = [];
