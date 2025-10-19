import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PesticideTile from '../../components/pesticideTile';
import { Pesticide } from '../../types';
import { supabase } from '../../src/lib/supabase';

const CommunityScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPesticides = async () => {
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
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPesticides();
    }, [])
  );

  const renderItem = ({ item }: { item: Pesticide }) => (
    <PesticideTile
      pesticide={item}
      onPress={() => router.push(`/products/pesticideDetails?id=${item.id}`)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.sectionHeader}>Community Product Review</Text>

      {/* Start content directly under shared top bar */}
      {loading ? (
        <ActivityIndicator size="large" color="#2ECC71" style={{}} />
      ) : (
        <FlatList
          data={pesticides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => router.push('/products/addProducts')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  plusButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2ECC71',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
    zIndex: 5, // Ensures header stays above dropdowns if they overlap
  },
});

export default CommunityScreen;
