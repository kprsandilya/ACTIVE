import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // The headerContainer now handles the top safe area padding only once.
  // We use `insets.top` here to push the content below the notch/status bar.
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>AgriCommunity</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="person-circle-outline" size={30} color="#2C3E50" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    // This is the full-width background for the header
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    // We rely on paddingTop: insets.top added inline
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    // Note: Removed backgroundColor, borderBottomWidth, and borderBottomColor from here
    // and moved them to headerContainer.
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});
