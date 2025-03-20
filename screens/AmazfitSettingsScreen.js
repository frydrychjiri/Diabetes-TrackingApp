// screens/AmazfitSettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { initAmazfitService, sendGlucoseToWatch } from '../services/AmazfitService';
import { getLatestReading } from '../services/GlucoseService';

export default function AmazfitSettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  
  useEffect(() => {
    // Inicializace Amazfit služby při prvním renderování
    if (isEnabled) {
      initAmazfitService();
      
      // Toto by bylo napojeno na skutečné události z nativního modulu
      // Pro ukázku používáme simulované zařízení
      setConnectedDevices([
        { name: 'Amazfit GTS 2', address: '00:11:22:33:44:55' }
      ]);
    }
  }, [isEnabled]);
  
  const toggleAmazfitIntegration = () => {
    if (!isEnabled) {
      // Zapnutí integrace
      setIsEnabled(true);
      // Zde by byla logika pro povolení v nastavení
    } else {
      // Vypnutí integrace
      setIsEnabled(false);
      // Zde by byla logika pro zakázání v nastavení
      setConnectedDevices([]);
    }
  };
  
  const handleManualSync = async () => {
    try {
      const reading = await getLatestReading();
      if (reading) {
        const result = await sendGlucoseToWatch(reading);
        if (result.success) {
          setLastSync(new Date());
          Alert.alert(
            "Synchronizace úspěšná",
            `Data byla odeslána do hodinek ${result.deviceName}`
          );
        } else {
          Alert.alert("Chyba synchronizace", result.error);
        }
      } else {
        Alert.alert("Chyba", "Nejsou dostupná žádná data ke sdílení");
      }
    } catch (error) {
      Alert.alert("Chyba", `Synchronizace selhala: ${error.message}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nastavení Amazfit</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Aktivovat Amazfit integraci</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#0066CC" : "#f4f3f4"}
            onValueChange={toggleAmazfitIntegration}
            value={isEnabled}
          />
        </View>
        
        <Text style={styles.sectionDescription}>
          Aktivací této funkce budou data o glukóze automaticky odesílána do připojených Amazfit hodinek.
        </Text>
      </View>
      
      {isEnabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Připojená zařízení</Text>
            {connectedDevices.length > 0 ? (
              connectedDevices.map(device => (
                <View key={device.address} style={styles.deviceRow}>
                  <Ionicons name="watch-outline" size={24} color="#0066CC" />
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceAddress}>{device.address}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="green" />
                </View>
              ))
            ) : (
              <Text style={styles.noDevicesText}>
                Žádná zařízení nenalezena. Ujistěte se, že jsou vaše Amazfit hodinky spárované s telefonem.
              </Text>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synchronizace</Text>
            <Text style={styles.syncInfo}>
              Poslední synchronizace: {lastSync ? lastSync.toLocaleString() : 'Nikdy'}
            </Text>
            <TouchableOpacity style={styles.syncButton} onPress={handleManualSync}>
              <Ionicons name="sync-outline" size={20} color="white" />
              <Text style={styles.syncButtonText}>Ruční synchronizace</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  section: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#212529',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212529',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#6c757d',
  },
  noDevicesText: {
    fontStyle: 'italic',
    color: '#6c757d',
    textAlign: 'center',
    marginVertical: 15,
  },
  syncInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  syncButton: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
