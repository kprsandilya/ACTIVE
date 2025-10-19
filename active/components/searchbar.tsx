import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pesticide } from '../types';

interface SelectorProps {
  label: string;
  selectedProduct: Pesticide | undefined;
  products: Pesticide[];
  onSelect: (id: string) => void;
  placeholder: string;
}

const SearchableProductSelector: React.FC<SelectorProps> = ({
  label,
  selectedProduct,
  products,
  onSelect,
  placeholder,
}) => {
  const [searchText, setSearchText] = useState('');
  const [isListVisible, setIsListVisible] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (product: Pesticide) => {
    onSelect(product.id);
    setSearchText(product.name); // Set text to the selected name
    setIsListVisible(false);
  };

  const handleFocus = () => {
    setIsListVisible(true);
    setSearchText(''); // Clear search when focusing to show full list
  };

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Search Input Field */}
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.icon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={handleFocus}
          onBlur={() => {
            // Delay hiding the list to allow click events to register
            setTimeout(() => {
              setIsListVisible(false);
              // If no product is selected, reset text to the current selection
              if (selectedProduct && searchText === '') {
                setSearchText(selectedProduct.name);
              }
            }, 200);
          }}
        />
      </View>

      {/* Selected Product Display */}
      {!isListVisible && selectedProduct && (
        <TouchableOpacity style={styles.selectionDisplay} onPress={handleFocus}>
          <Text style={styles.selectionText}>{selectedProduct.name}</Text>
          <Ionicons name="caret-down" size={16} color="#3498DB" />
        </TouchableOpacity>
      )}

      {/* Filtered List Dropdown */}
      {isListVisible && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
                <Text style={styles.dropdownSubText}>({item.manufacturer})</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No matching products found.</Text>
            )}
            keyboardShouldPersistTaps="always"
            style={styles.dropdownList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectorContainer: {
    flex: 1,
    marginHorizontal: 5,
    zIndex: 10, // Ensure dropdown renders on top
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  selectionDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECF0F1',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  dropdown: {
    position: 'absolute',
    top: 85, // Adjust based on your layout
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#3498DB',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    elevation: 5,
    zIndex: 20,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '500',
  },
  dropdownSubText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  emptyText: {
    padding: 10,
    textAlign: 'center',
    color: '#7F8C8D',
  }
});

export default SearchableProductSelector;