import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SAMPLE_PESTICIDES } from '../../types';

const MOCK_REVIEWS = [
  { id: 'R001', user: 'Farmer John', rating: 5, text: 'Amazing on corn! Saw results within a week.' },
  { id: 'R002', user: 'AgriGirl', rating: 4, text: 'Solid product, a bit pricy, but very reliable for weed control.' },
];

const PesticideDetailScreen: React.FC = () => {
  const { id: pesticideId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pesticide = SAMPLE_PESTICIDES.find(p => p.id === pesticideId);

  const [comment, setComment] = useState('');

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      Alert.alert('Comment Submitted', `Your comment: "${comment}" has been posted.`);
      setComment('');
    } else {
      Alert.alert('Error', 'Comment cannot be empty.');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={24}
          color="#FFD700"
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };
  
  if (!pesticide) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Pesticide not found! 🐞</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3498DB" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Removed custom header and back button. Native stack header handles this now. */}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{pesticide.name}</Text>
          <Text style={styles.sectionSubtitle}>Manufactured by: {pesticide.manufacturer}</Text>
          <Text style={styles.sectionSubtitle}>Type: {pesticide.type}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Average Community Rating</Text>
          <View style={styles.ratingBox}>
            {renderStars(pesticide.averageRating)}
            <Text style={styles.ratingText}>{pesticide.averageRating.toFixed(1)} / 5 Stars</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.detailText}>{pesticide.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Ingredients List</Text>
          {pesticide.activeIngredients.map((ing, index) => (
            <Text key={index} style={styles.listItemText}>• {ing}</Text>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Reviews ({MOCK_REVIEWS.length})</Text>
          {MOCK_REVIEWS.map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>Leave a Comment / Review</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            placeholder="Share your experience with this product..."
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleCommentSubmit}>
            <Text style={styles.submitButtonText}>Submit Comment</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  detailText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
  listItemText: {
    fontSize: 15,
    color: '#34495E',
    marginLeft: 5,
    paddingVertical: 3,
  },
  reviewCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2ECC71',
    paddingLeft: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontWeight: 'bold',
    color: '#2980B9',
  },
  reviewText: {
    color: '#34495E',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#3498DB',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  }
});

export default PesticideDetailScreen;