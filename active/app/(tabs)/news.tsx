import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../src/lib/supabase';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchNewsForRegion } from '../../src/lib/news';
import { getCountryFromPolygon } from '../../src/lib/regionLocator'; // 👈 wherever you put the turf function

export default function NewsScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPolygons, setUserPolygons] = useState<any[]>([]);
  const [loadingPolygons, setLoadingPolygons] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('United States'); // 👈 sensible default

  const getUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  useEffect(() => {
    const fetchPolygons = async () => {
      setLoadingPolygons(true);
      const userId = await getUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to load user polygons:', error);
      } else if (data && data.length > 0) {
        setUserPolygons(data);

        // 👇 Extract first polygon's region name using your turf function
        try {
          const geom = data[0].geom; // PostGIS geometry object
          const geojson = {
            type: 'Feature',
            geometry: geom,
            properties: {},
          } as GeoJSON.Feature;

          const region = getCountryFromPolygon(geojson);
          console.log('Detected region:', region);
          setSelectedRegion(region || 'United States');
        } catch (err) {
          console.warn('Failed to determine region:', err);
          setSelectedRegion('United States');
        }
      }
      setLoadingPolygons(false);
    };

    fetchPolygons();
  }, []);

  // 👇 Fetch region-specific news when selectedRegion changes
  const fetchRegionNews = async (forceRefresh = false, isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const news = await fetchNewsForRegion(selectedRegion, forceRefresh);
      setArticles(news);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setArticles([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRegion) {
      fetchRegionNews(false, true);
    }
  }, [selectedRegion]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRegionNews(true);
    setRefreshing(false);
  }, [selectedRegion]);

  if (loading || loadingPolygons) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.region}>{selectedRegion} Agriculture News</Text>

        {articles.length === 0 ? (
          <Text style={styles.noNews}>No news found.</Text>
        ) : (
          articles.map((article, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => Linking.openURL(article.url)}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/images/farm-placeholder.jpg')}
                style={styles.thumbnail}
              />
              <View style={styles.textContainer}>
                <Text style={styles.title}>{article.title}</Text>
                <View style={styles.meta}>
                  <Text style={styles.source}>{article.source}</Text>
                  <Text style={styles.date}>
                    {article.pubDate ? new Date(article.pubDate).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  region: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  noNews: {
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  textContainer: { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  source: { fontSize: 12, color: '#888' },
  date: { fontSize: 12, color: '#888' },
});
