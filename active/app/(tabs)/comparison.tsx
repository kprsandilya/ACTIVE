import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Pesticide } from '../../types';
import { calculateSimilarity } from '../../utils/comparisonLogic';
import SearchableProductSelector from '../../components/searchbar';

// Offset to push content below custom transparent header
const HEADER_CONTENT_OFFSET = 65;

const ComparisonScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId1, setSelectedId1] = useState<string>('');
  const [selectedId2, setSelectedId2] = useState<string>('');

  // Fetch pesticides and calculate average ratings
  const fetchPesticides = useCallback(async () => {
    setLoading(true);

    const { data: pesticidesData, error: pesticidesError } = await supabase
      .from('pesticides')
      .select('*');

    if (pesticidesError || !pesticidesData) {
      console.error('Supabase fetch error:', pesticidesError);
      setLoading(false);
      return;
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*');

    if (commentsError) console.error('Supabase comments fetch error:', commentsError);

    const pesticidesWithRatings = pesticidesData.map((p) => {
      const relatedComments = commentsData?.filter((c) => c.pesticide_id === p.id) || [];
      const averageRating =
        relatedComments.length > 0
          ? relatedComments.reduce((sum, c) => sum + c.rating, 0) / relatedComments.length
          : null;
      return { ...p, averageRating };
    });

    setPesticides(pesticidesWithRatings);

    // Set sensible defaults if none selected yet
    if (!selectedId1 && pesticidesWithRatings.length > 0) {
      setSelectedId1(pesticidesWithRatings[0].id);
      setSelectedId2(pesticidesWithRatings.length > 1 ? pesticidesWithRatings[1].id : pesticidesWithRatings[0].id);
    }

    setLoading(false);
  }, [selectedId1, selectedId2]);

  useEffect(() => {
  fetchPesticides(); // initial load

  const subscription = supabase
    .channel('pesticides-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pesticides' },
      () => {
        fetchPesticides();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [fetchPesticides]);

  const product1 = pesticides.find(p => p.id === selectedId1);
  const product2 = pesticides.find(p => p.id === selectedId2);

  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  useEffect(() => {
    if (loading) {
      setSimilarityScore(null);
      return; // skip calculation while loading
    }

    const product1 = pesticides.find(p => p.id === selectedId1);
    const product2 = pesticides.find(p => p.id === selectedId2);

    if (product1 && product2 && product1.active_ingredients.length && product2.active_ingredients.length) {
      const score = calculateSimilarity(product1, product2);
      setSimilarityScore(score);
    } else {
      setSimilarityScore(null);
    }
  }, [selectedId1, selectedId2, pesticides, loading]);


  const handleSwap = () => {
    setSelectedId1(selectedId2);
    setSelectedId2(selectedId1);
  };

  const renderProductInfo = (product: Pesticide | undefined) => {
    if (!product) return <Text style={styles.noProductText}>Select a product to compare.</Text>;

    return (
      <View style={styles.productCard}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.manufacturer}>{product.manufacturer}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{product.type ?? 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Crop:</Text>
          <Text style={styles.value}>{product.suggested_crop ?? 'N/A'}</Text>
        </View>

        <Text style={styles.subHeading}>Active Ingredients:</Text>
        {product.active_ingredients?.length
          ? product.active_ingredients.map((ing, index) => (
              <Text key={index} style={styles.ingredientText}>• {ing}</Text>
            ))
          : <Text style={styles.ingredientText}>No ingredients listed</Text>
        }

        <Text style={styles.subHeading}>Rating:</Text>
        <Text style={styles.ratingText}>
          {product.averageRating != null ? product.averageRating.toFixed(1) : '-'} / 5
        </Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2ECC71" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + HEADER_CONTENT_OFFSET }]}>
      <Text style={styles.mainHeader}>Pesticide Comparison Tool ⚖️</Text>

      <View style={styles.selectorRow}>
        <SearchableProductSelector
          label="Product 1"
          selectedProduct={product1}
          products={pesticides.filter(p => p.id !== selectedId2)}
          onSelect={setSelectedId1}
          placeholder="Search for a product..."
        />

        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#3498DB" />
        </TouchableOpacity>

        <SearchableProductSelector
          label="Product 2"
          selectedProduct={product2}
          products={pesticides.filter(p => p.id !== selectedId1)}
          onSelect={setSelectedId2}
          placeholder="Search for a product..."
        />
      </View>

      <ScrollView contentContainerStyle={styles.comparisonContent}>
        {product1 && product2 && (
          <View style={styles.similarityBox}>
            <Text style={styles.similarityTitle}>Similarity Score (Ingredients)</Text>
            <Text style={styles.similarityScore}>{similarityScore ?? '-'}</Text>
          </View>
        )}

        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>{renderProductInfo(product1)}</View>
          <View style={styles.comparisonColumn}>{renderProductInfo(product2)}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F3F5' },
  mainHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
    zIndex: 5,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    zIndex: 10,
  },
  swapButton: { marginHorizontal: 5, padding: 8, borderRadius: 50, backgroundColor: '#E8F6F3', marginBottom: 5 },
  comparisonContent: { padding: 10, zIndex: 1 },
  similarityBox: {
    backgroundColor: '#E8F6F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  similarityTitle: { fontSize: 14, fontWeight: '600', color: '#27AE60' },
  similarityScore: { fontSize: 32, fontWeight: 'bold', color: '#27AE60', marginTop: 5 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  comparisonColumn: { flex: 1, marginHorizontal: 5 },
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
  productName: { fontSize: 18, fontWeight: 'bold', color: '#3498DB', marginBottom: 2 },
  manufacturer: { fontSize: 14, color: '#7F8C8D', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ECF0F1', paddingBottom: 5 },
  detailRow: { flexDirection: 'row', marginBottom: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#34495E', marginRight: 5 },
  value: { fontSize: 14, color: '#2C3E50' },
  subHeading: { fontSize: 14, fontWeight: '700', color: '#34495E', marginTop: 10, marginBottom: 5 },
  ingredientText: { fontSize: 13, color: '#34495E', marginLeft: 5 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#FFD700' },
  noProductText: { textAlign: 'center', padding: 20, color: '#7F8C8D' },
});

export default ComparisonScreen;
