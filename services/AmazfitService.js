// services/AmazfitService.js
import { NativeModules, NativeEventEmitter } from 'react-native';
import { saveLastSentValue } from './StorageService';

// Předpokládáme, že existuje nativní modul implementovaný v Java/Kotlin
const { AmazfitModule } = NativeModules;
const amazfitEmitter = new NativeEventEmitter(AmazfitModule);

// Inicializace služby
export const initAmazfitService = () => {
  // Naslouchá na události z hodinek
  amazfitEmitter.addListener('onAmazfitConnected', handleAmazfitConnected);
  amazfitEmitter.addListener('onAmazfitDisconnected', handleAmazfitDisconnected);
  amazfitEmitter.addListener('onDataRequest', handleDataRequest);
  
  // Registruje aplikaci jako zdroj dat pro Amazfit
  AmazfitModule.registerAsDataProvider('glucose_tracker');
  
  console.log('Amazfit služba inicializována');
};

// Zpracování událostí
const handleAmazfitConnected = (deviceInfo) => {
  console.log('Amazfit hodinky připojeny:', deviceInfo);
  // Zde můžete přidat logiku pro notifikaci uživatele
};

const handleAmazfitDisconnected = () => {
  console.log('Amazfit hodinky odpojeny');
  // Zde můžete přidat logiku pro notifikaci uživatele
};

const handleDataRequest = async () => {
  // Automaticky odešle poslední známá data
  const lastReading = await getLatestReading();
  if (lastReading) {
    sendGlucoseToWatch(lastReading);
  }
};

// Funkce pro odeslání hodnoty glukózy na hodinky
export const sendGlucoseToWatch = async (glucoseData) => {
  try {
    // Formát dat pro Amazfit
    const watchData = {
      timestamp: glucoseData.timestamp.getTime(),
      glucoseValue: glucoseData.value,
      trendArrow: mapTrendToArrow(glucoseData.trend),
      unit: 'mmol/L',
      isHigh: glucoseData.value > 10, // Přizpůsobte vašim mezním hodnotám
      isLow: glucoseData.value < 3.9, // Přizpůsobte vašim mezním hodnotám
    };
    
    // Odeslání dat do hodinek
    const result = await AmazfitModule.sendData('glucose', JSON.stringify(watchData));
    
    // Uložení informace o posledním odeslání
    if (result.success) {
      saveLastSentValue({
        timestamp: new Date(),
        value: glucoseData.value,
        deviceName: result.deviceName
      });
    }
    
    return result;
  } catch (error) {
    console.error('Chyba při odesílání dat do Amazfit hodinek:', error);
    return { success: false, error: error.message };
  }
};

// Pomocná funkce pro mapování trendu na ikonu šipky
const mapTrendToArrow = (trend) => {
  switch (trend) {
    case 'RapidlyRising': return 'DOUBLE_UP';
    case 'Rising': return 'SINGLE_UP';
    case 'Stable': return 'FLAT';
    case 'Falling': return 'SINGLE_DOWN';
    case 'RapidlyFalling': return 'DOUBLE_DOWN';
    default: return 'NONE';
  }
};

// Pomocná funkce pro získání posledního čtení
const getLatestReading = async () => {
  // Toto by bylo implementováno ve vaší službě pro správu dat
  // Importovali byste to z GlucoseService
  // Zde je zástupný příklad
  return {
    timestamp: new Date(),
    value: 5.6,
    trend: 'Stable'
  };
};
