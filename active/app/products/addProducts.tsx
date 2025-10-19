import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const AddProductScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [type, setType] = useState<'Herbicide' | 'Insecticide' | 'Fungicide' | ''>('');
  const [activeIngredients, setActiveIngredients] = useState('');
  const [suggestedCrop, setSuggestedCrop] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name || !manufacturer || !type || !activeIngredients || !suggestedCrop || !description) {
      Alert.alert('Missing Fields', 'Please fill out all product information fields.');
      return;
    }

    const newProductData = {
      name,
      manufacturer,
      type,
      activeIngredients: activeIngredients.split(',').map(s => s.trim()),
      suggestedCrop,
      description,
    };

    console.log('New Product Submission:', newProductData);
    Alert.alert('Product Added for Review', 'Thank you! Your product submission will be reviewed by the community.');
    
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Removed custom header and back button. Native stack header handles this now. */}

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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue as 'Herbicide' | 'Insecticide' | 'Fungicide' | '')}
            style={styles.picker}
          >
            <Picker.Item label="Select Product Type" value="" color="#999" />
            <Picker.Item label="Herbicide" value="Herbicide" />
            <Picker.Item label="Insecticide" value="Insecticide" />
            <Picker.Item label="Fungicide" value="Fungicide" />
          </Picker>
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
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  scrollContent: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 15,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AddProductScreen;