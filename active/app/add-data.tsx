import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../src/lib/supabase';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AddFieldData() {
  const { fieldId } = useLocalSearchParams<{ fieldId: string }>();
  const router = useRouter();

  const [herbicide, setHerbicide] = useState('');
  const [pests, setPests] = useState('');

  const submitData = async () => {
    if (!herbicide && !pests) {
      return Alert.alert('Validation Error', 'Please enter at least one field.');
    }

    const pestsArray = pests
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const { error } = await supabase.from('field_data').insert([
      {
        field_id: fieldId,
        herbicide,
        pests_seen: pestsArray,
      },
    ]);

    if (error) return Alert.alert('Error', error.message);

    Alert.alert('Success', 'Field data saved!');
    router.replace('/map');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
            <IconSymbol
                size={310}
                color="#808080"
                name="chevron.left.forwardslash.chevron.right"
                style={styles.headerImage}
            />
            }>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Add Field Data</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Herbicide Used</Text>
          <TextInput
            placeholder="Enter herbicide"
            value={herbicide}
            onChangeText={setHerbicide}
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Pests Seen</Text>
          <TextInput
            placeholder="Enter pests (comma separated)"
            value={pests}
            onChangeText={setPests}
            style={styles.input}
          />
        </View>

        <Pressable style={styles.button} onPress={submitData}>
          <Text style={styles.buttonText}>Submit Field Data</Text>
        </Pressable>
      </ScrollView>
      </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f8',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#111',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#4F46E5', // Indigo 600
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
