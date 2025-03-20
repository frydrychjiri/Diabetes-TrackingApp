// screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Komponenty
import GlucoseReading from '../components/GlucoseReading';
import TrendIndicator from '../components/TrendIndicator';
import StatCard from '../components/StatCard';

// Služby
import { getLatestReading, getRecentReadings } from '../services/GlucoseService';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [currentReading, setCurrentReading] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [timeRange, setTimeRange] = useState('3h'); // 3h, 6h, 12h, 24h
  
  useEffect(() => {
    // Načtení dat při prvním vykreslení
    loadData();
    
    // Interval pro obnovování dat
    const interval = setInterval(loadData, 60000); // každou minutu
    return () => clearInterval(interval);
  }, [timeRange]);
  
  const loadData = async () => {
    const latest = await getLatestReading();
    setCurrentReading(latest);
    
    const recent = await getRecentReadings(timeRange);
    setRecentReadings(recent);
  };
  
  // Pokud nemáme data, zobrazíme zástupný obsah
  if (!currentReading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Načítání dat...</Text>
      </SafeAreaView>
    );
  }
  
  // Příprava dat pro graf
  const chartData = {
    labels: recentReadings.map(reading => {
      const date = new Date(reading.timestamp);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        data: recentReadings.map(reading => reading.value),
        color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Glukózový monitor</Text>
          <TouchableOpacity onPress={() => {/* Akce pro obnovení */}}>
            <Ionicons name="refresh" size={24} color="#0066CC" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.currentReadingContainer}>
          <GlucoseReading 
            value={currentReading.value} 
            unit="mmol/L" 
            timestamp={currentReading.timestamp} 
          />
          <TrendIndicator trend={currentReading.trend} />
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.timeRangeSelector}>
            {['3h', '6h', '12h', '24h'].map(range => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <LineChart
            data={chartData}
            width={screenWidth - 30}
            height={220}
            yAxisSuffix=" mmol/L"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#0066CC'
              }
            }}
            bezier
            style={styles.chart}
          />
          
          <View style={styles.targetRange}>
            <View style={styles.targetRangeUpper} />
            <View style={styles.targetRangeLower} />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            title="Průměr" 
            value={`${calculateAverage(recentReadings).toFixed(1)} mmol/L`} 
            icon="analytics-outline" 
          />
          <StatCard 
            title="Min" 
            value={`${findMin(recentReadings).toFixed(1)} mmol/L`} 
            icon="arrow-down-outline" 
          />
          <StatCard 
            title="Max" 
            value={`${findMax(recentReadings).toFixed(1)} mmol/L`} 
            icon="arrow-up-outline" 
          />
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Přidat měření</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="nutrition-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Zaznamenat jídlo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Pomocné funkce pro výpočty
const calculateAverage = (readings) => {
  if (readings.length === 0) return 0;
  const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
  return sum / readings.length;
};

const findMin = (readings) => {
  if (readings.length === 0) return 0;
  return Math.min(...readings.map(reading => reading.value));
};

const findMax = (readings) => {
  if (readings.length === 0) return 0;
  return Math.max(...readings.map(reading => reading.value));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  currentReadingContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
  },
  timeRangeButtonActive: {
    backgroundColor: '#0066CC',
  },
  timeRangeText: {
    color: '#495057',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  targetRange: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    bottom: 30,
    zIndex: -1,
  },
  targetRangeUpper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '30%',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  targetRangeLower: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
