import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../../src/lib/supabase'; // make sure this points to your initialized supabase client

const AddProductScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState('');
  const [activeIngredients, setActiveIngredients] = useState('');
  const [suggestedCrop, setSuggestedCrop] = useState('');
  const [description, setDescription] = useState('');

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Herbicide', value: 'Herbicide' },
    { label: 'Insecticide', value: 'Insecticide' },
    { label: 'Fungicide', value: 'Fungicide' },
  ]);

  const handleSubmit = async () => {
    if (!name || !manufacturer || !type || !activeIngredients || !suggestedCrop || !description) {
      Alert.alert('Missing Fields', 'Please fill out all product information fields.');
      return;
    }

    const newProductData = {
      name,
      manufacturer,
      type,
      active_ingredients: activeIngredients.split(',').map(s => s.trim()),
      suggested_crop: suggestedCrop,
      description,
    };

    const { data, error } = await supabase.from('pesticides').insert([newProductData]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      Alert.alert('Error', 'Failed to submit product. Please try again.');
      return;
    }

    console.log('New Product Submission:', data);
    Alert.alert('Product Added for Review', 'Thank you! Your product submission will be reviewed by the community.');
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.inputLabel}>Product Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g., GreenGrow Max"
        />

        <Text style={styles.inputLabel}>Manufacturer</Text>
        <TextInput
          style={styles.textInput}
          value={manufacturer}
          onChangeText={setManufacturer}
          placeholder="e.g., AgriSolutions Co."
        />

        <Text style={styles.inputLabel}>Type (Herbicide, Insecticide, Fungicide)</Text>
        <View style={{ zIndex: 1000, marginBottom: 10 }}>
          <DropDownPicker
            open={open}
            value={type}
            items={items}
            setOpen={setOpen}
            setValue={setType}
            setItems={setItems}
            placeholder="Select Product Type"
            style={{ borderColor: '#BDC3C7', backgroundColor: '#fff' }}
            dropDownContainerStyle={{ borderColor: '#BDC3C7', backgroundColor: '#fff' }}
            listMode="SCROLLVIEW" // avoids virtualized list conflict
          />
        </View>

        <Text style={styles.inputLabel}>Active Ingredients (Comma Separated)</Text>
        <TextInput
          style={styles.textInput}
          value={activeIngredients}
          onChangeText={setActiveIngredients}
          placeholder="e.g., Glyphosate (50%), 2,4-D (10%)"
        />

        <Text style={styles.inputLabel}>Suggested Crop</Text>
        <TextInput
          style={styles.textInput}
          value={suggestedCrop}
          onChangeText={setSuggestedCrop}
          placeholder="e.g., Corn or Wheat"
        />

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, { height: 100 }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Provide a brief product description and main use."
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  scrollContent: { padding: 15 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#34495E', marginTop: 15, marginBottom: 5 },
  textInput: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 6, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  submitButton: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 6, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

export default AddProductScreen;
