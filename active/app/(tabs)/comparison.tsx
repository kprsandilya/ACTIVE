import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SAMPLE_PESTICIDES, Pesticide } from '../../types';
import { calculateSimilarity } from '../../utils/comparisonLogic';
import SearchableProductSelector from '../../components/searchbar'; // Import new component

const ComparisonScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  // Use a sensible default, ensuring they aren't the same for initial state
  const defaultId1 = SAMPLE_PESTICIDES[0]?.id || '';
  const defaultId2 = SAMPLE_PESTICIDES[1]?.id || (SAMPLE_PESTICIDES.length > 1 ? SAMPLE_PESTICIDES[1]?.id : defaultId1);

  const [selectedId1, setSelectedId1] = useState(defaultId1);
  const [selectedId2, setSelectedId2] = useState(defaultId2);

  const product1 = SAMPLE_PESTICIDES.find(p => p.id === selectedId1);
  const product2 = SAMPLE_PESTICIDES.find(p => p.id === selectedId2);

  const similarityScore = (product1 && product2) 
    ? calculateSimilarity(product1, product2) 
    : null;

  const handleSwap = () => {
    setSelectedId1(selectedId2);
    setSelectedId2(selectedId1);
  };

  const renderProductInfo = (product: Pesticide | undefined) => {
    if (!product) {
      return <Text style={styles.noProductText}>Select a product to compare.</Text>;
    }
    
    // ... (rest of renderProductInfo function remains the same) ...
    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.manufacturer}>{product.manufacturer}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{product.type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Crop:</Text>
          <Text style={styles.value}>{product.suggestedCrop}</Text>
        </View>

        <Text style={styles.subHeading}>Active Ingredients:</Text>
        {product.activeIngredients.map((ing, index) => (
          <Text key={index} style={styles.ingredientText}>• {ing}</Text>
        ))}

        <Text style={styles.subHeading}>Rating:</Text>
        <Text style={styles.ratingText}>{product.averageRating.toFixed(1)} / 5</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.mainHeader}>Pesticide Comparison Tool ⚖️</Text>
      
      <View style={styles.selectorRow}>
        
        <SearchableProductSelector
          label="Product 1"
          selectedProduct={product1}
          products={SAMPLE_PESTICIDES.filter(p => p.id !== selectedId2)} // Exclude product 2 from list
          onSelect={setSelectedId1}
          placeholder="Search for a product..."
        />

        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#3498DB" />
        </TouchableOpacity>

        <SearchableProductSelector
          label="Product 2"
          selectedProduct={product2}
          products={SAMPLE_PESTICIDES.filter(p => p.id !== selectedId1)} // Exclude product 1 from list
          onSelect={setSelectedId2}
          placeholder="Search for a product..."
        />
        
      </View>

      <ScrollView contentContainerStyle={styles.comparisonContent}>
        {(product1 && product2) && (
          <View style={styles.similarityBox}>
            <Text style={styles.similarityTitle}>Similarity Score (Ingredients)</Text>
            <Text style={styles.similarityScore}>{similarityScore}%</Text>
          </View>
        )}
        
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            {renderProductInfo(product1)}
          </View>
          <View style={styles.comparisonColumn}>
            {renderProductInfo(product2)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F5',
  },
  mainHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
    zIndex: 5, // Ensures header stays above dropdowns if they overlap
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligns selectors nicely
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    zIndex: 10, // Ensure the selector row is above the content
  },
  swapButton: {
    marginHorizontal: 5,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#E8F6F3',
    marginBottom: 5, // Align with the bottom of the input boxes
  },
  comparisonContent: {
    padding: 10,
    zIndex: 1,
  },
  similarityBox: {
    backgroundColor: '#E8F6F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  similarityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
  },
  similarityScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 5,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 2,
  },
  manufacturer: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginRight: 5,
  },
  value: {
    fontSize: 14,
    color: '#2C3E50',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34495E',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredientText: {
    fontSize: 13,
    color: '#34495E',
    marginLeft: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  noProductText: {
    textAlign: 'center',
    padding: 20,
    color: '#7F8C8D',
  }
});

export default ComparisonScreen;