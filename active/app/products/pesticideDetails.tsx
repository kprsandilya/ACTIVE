import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

interface Comment {
  id: string;
  pesticide_id: string;
  user_id: string;
  rating: number;
  comment_text: string;
  created_at: string;
}

interface Pesticide {
  id: string;
  name: string;
  manufacturer: string;
  type: string;
  active_ingredients: string[];
  suggested_crop: string;
  description: string;
  averageRating?: number; // computed client-side
}

const PesticideDetailScreen: React.FC = () => {
  const { id: pesticideId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pesticide, setPesticide] = useState<Pesticide | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch pesticide + comments
  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: pesticideData, error: pesticideError } = await supabase
      .from('pesticides')
      .select('*')
      .eq('id', pesticideId)
      .single();

    if (pesticideError || !pesticideData) {
      console.error('Pesticide fetch error:', pesticideError);
      setLoading(false);
      return;
    }

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('pesticide_id', pesticideId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Comments fetch error:', commentsError);
    }

    // Compute average rating
    const averageRating =
      commentsData && commentsData.length > 0
        ? commentsData.reduce((sum, c) => sum + c.rating, 0) / commentsData.length
        : null;

    setPesticide({ ...pesticideData, averageRating });
    setComments(commentsData || []);
    setLoading(false);
  }, [pesticideId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.from('comments').insert([
      {
        pesticide_id: pesticideId,
        user_id: 'anonymous', // replace with real user
        rating,
        comment_text: commentText.trim(),
      },
    ]);

    if (error) {
      console.error('Comment submit error:', error);
      Alert.alert('Error', 'Failed to submit comment.');
    } else {
      setCommentText('');
      setRating(5);
      fetchData(); // refresh comments + average rating
    }

    setSubmitting(false);
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => interactive && setRating(i)}
        >
          <Ionicons
            name={i <= ratingValue ? 'star' : 'star-outline'}
            size={24}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  if (loading || !pesticide) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2ECC71" />
      </View>
    );
  }

  return (
  <View style={[styles.container, { paddingTop: insets.top }]}>
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#34495E" />
      </TouchableOpacity>
      <Text style={styles.topBarTitle}>{pesticide.name}</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      
      {/* Product Header */}
      <View style={[styles.section, styles.headerSection]}>
        <Text style={styles.sectionTitle}>{pesticide.name}</Text>
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, styles.manufacturerBadge]}>{pesticide.manufacturer}</Text>
          <Text style={[styles.badge, styles.typeBadge]}>{pesticide.type}</Text>
        </View>
      </View>

      {/* Average Rating */}
      <View style={[styles.section, styles.ratingSection]}>
        <Text style={styles.sectionTitle}>Community Rating</Text>
        <View style={styles.ratingBox}>
          {pesticide.averageRating != null ? renderStars(pesticide.averageRating) : <Text>No ratings yet</Text>}
          {pesticide.averageRating != null && (
            <Text style={styles.ratingText}>{pesticide.averageRating.toFixed(1)} / 5</Text>
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.detailText}>{pesticide.description}</Text>
      </View>

      {/* Active Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Ingredients</Text>
        {pesticide.active_ingredients.map((ing, idx) => (
          <Text key={idx} style={styles.listItemText}>• {ing}</Text>
        ))}
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Reviews ({comments.length})</Text>
        {comments.length === 0 && <Text style={styles.noReviewsText}>No reviews yet. Be the first!</Text>}
        {comments.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUser}>{review.user_id}</Text>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.reviewText}>{review.comment_text}</Text>
          </View>
        ))}
      </View>

      {/* Add Review */}
      <View style={[styles.section, styles.addReviewSection]}>
        <Text style={styles.sectionTitle}>Leave a Comment / Review</Text>
        <Text style={{ marginBottom: 5, fontWeight: '600' }}>Your Rating:</Text>
        {renderStars(rating, true)}
        <TextInput
          style={styles.commentInput}
          multiline
          placeholder="Share your experience..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={[styles.submitButton, submitting && { backgroundColor: '#95A5A6' }]}
          onPress={handleCommentSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Comment'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
);

};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  scrollContent: { padding: 15 },
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
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#34495E', marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, color: '#7F8C8D', marginBottom: 5 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  starContainer: { flexDirection: 'row', marginRight: 10 },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginLeft: 10 },
  detailText: { fontSize: 16, color: '#34495E', lineHeight: 24 },
  listItemText: { fontSize: 15, color: '#34495E', marginLeft: 5, paddingVertical: 3 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  reviewUser: { fontWeight: 'bold', color: '#2980B9' },
  reviewText: { color: '#34495E' },
  commentInput: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 6, padding: 10, minHeight: 80, textAlignVertical: 'top', fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  submitButton: { backgroundColor: '#3498DB', padding: 12, borderRadius: 6, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerSection: {
  backgroundColor: '#2ECC71',
  padding: 20,
  borderRadius: 12,
  marginBottom: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 4,
},
badgeRow: {
  flexDirection: 'row',
  marginTop: 10,
},
badge: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  marginRight: 8,
  overflow: 'hidden',
},
manufacturerBadge: { backgroundColor: '#2980B9' },
typeBadge: { backgroundColor: '#F39C12' },
ratingSection: {
  backgroundColor: '#FDF6EC',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
},
reviewCard: {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 8,
  marginVertical: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
},
noReviewsText: { fontStyle: 'italic', color: '#7F8C8D' },
addReviewSection: {
  backgroundColor: '#EBF5FB',
  borderRadius: 10,
  padding: 15,
},
topBar: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 15,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#ECF0F1',
},
backButton: {
  marginRight: 10,
},
topBarTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#2C3E50',
  flexShrink: 1,
},

});

export default PesticideDetailScreen;
