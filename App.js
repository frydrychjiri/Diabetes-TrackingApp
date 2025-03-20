// App.js - Hlavní komponenta aplikace
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importy obrazovek
import DashboardScreen from './screens/DashboardScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CalibrationScreen from './screens/CalibrationScreen';

// Služby pro práci s daty
import { setupDataSync } from './services/DataSyncService';
import { setupAlerts } from './services/AlertService';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [glucoseData, setGlucoseData] = useState([]);
  
  useEffect(() => {
    // Inicializace služeb při spuštění
    setupDataSync();
    setupAlerts();
    
    // Načtení historických dat
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    // Zde by bylo volání API nebo načtení z lokální databáze
    // Simulace pro ukázku
    setTimeout(() => {
      setGlucoseData(sampleData);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Statistics') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Alerts') {
                iconName = focused ? 'notifications' : 'notifications-outline';
              } else if (route.name === 'Calibration') {
                iconName = focused ? 'color-filter' : 'color-filter-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0066CC',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Statistics" component={StatisticsScreen} />
          <Tab.Screen name="Alerts" component={AlertsScreen} />
          <Tab.Screen name="Calibration" component={CalibrationScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Ukázkové testovací data
const sampleData = [
  { timestamp: new Date(Date.now() - 5 * 60000), value: 5.6, trend: 'Stable' },
  { timestamp: new Date(Date.now() - 10 * 60000), value: 5.5, trend: 'Stable' },
  // Další data by byla zde
];
