import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { getCountryFromPolygon } from '../../src/lib/regionLocator';
import { fetchNewsForRegion } from '../../src/lib/news';

export default function NewsScreen() {
  const [articles, setArticles] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  const fetchFieldNews = async (forceRefresh = false) => {
    setLoading(true);
    const userId = await getUserId();
    if (!userId) return;

    const { data: fields, error } = await supabase.from('fields').select('*').eq('user_id', userId);
    if (error) return console.error(error);

    const result: Record<string, any[]> = {};

    for (const field of fields) {
      let region = field.region;
      if (!region) {
        region = getCountryFromPolygon(field.geom);
        await supabase.from('fields').update({ region }).eq('id', field.id);
      }

      const news = await fetchNewsForRegion(region);
      result[region] = news;
    }

    setArticles(result);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFieldNews(true);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchFieldNews();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {Object.entries(articles).map(([region, newsList]) => (
        <View key={region} style={styles.section}>
          <Text style={styles.region}>{region}</Text>
          {newsList.map((article, i) => (
            <Text key={i} style={styles.article} onPress={() => Linking.openURL(article.url)}>
              • {article.title}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  section: { marginBottom: 24 },
  region: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  article: { marginBottom: 4, color: '#007AFF' },
});
