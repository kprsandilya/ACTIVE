import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out.');
    // Add actual logout logic here
    router.push('/login'); // redirect to login
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#34495E" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Edit Profile', 'Edit profile clicked')}>
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Change Password', 'Change password clicked')}>
          <Text style={styles.optionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>App</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => Alert.alert('Notifications', 'Manage notifications clicked')}>
          <Text style={styles.optionText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionButton, { borderBottomWidth: 0 }]} onPress={handleLogout}>
          <Text style={[styles.optionText, { color: '#E74C3C' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 10,
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34495E',
    marginTop: 20,
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  optionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default SettingsScreen;
