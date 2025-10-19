import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PesticideTile from '../../components/pesticideTile';
import { SAMPLE_PESTICIDES } from '../../types';

const CommunityScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: typeof SAMPLE_PESTICIDES[0] }) => (
    <PesticideTile
      pesticide={item}
      onPress={() => router.push(`/products/pesticideDetails`)}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Community Pesticide Exchange 👨‍🌾</Text>
      
      <FlatList
        data={SAMPLE_PESTICIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

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
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
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
});

export default CommunityScreen;