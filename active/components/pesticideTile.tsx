import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pesticide } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface PesticideTileProps {
  pesticide: Pesticide;
  onPress: () => void;
}

const PesticideTile: React.FC<PesticideTileProps> = ({ pesticide, onPress }) => {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{pesticide.name}</Text>
        <Text style={styles.ratingText}>
          {pesticide.averageRating.toFixed(1)} <Ionicons name="star" size={16} color="#FFD700" />
        </Text>
      </View>
      <Text style={styles.manufacturer}>{pesticide.manufacturer}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Type:</Text>
        <Text style={styles.infoValue}>{pesticide.type}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Suggested Crop:</Text>
        <Text style={styles.infoValue}>{pesticide.suggestedCrop}</Text>
      </View>
      <Text style={styles.suggestedLabel}>Suggested Product</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498DB',
    flexShrink: 1,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  manufacturer: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
  },
  suggestedLabel: {
    alignSelf: 'flex-end',
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#27AE60',
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  }
});

export default PesticideTile;