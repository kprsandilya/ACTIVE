import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const fetchNewsForRegion = async (region: string) => {
  const apiKey = 'YOUR_NEWSDATA_API_KEY';
  const cacheKey = `news_${region}`;
  const cacheTTL = 12 * 60 * 60 * 1000; // 12 hours

  const NEWS_API_KEY = Constants.expoConfig?.extra?.newsAPIKey;

  // 1️⃣ Try loading cached data
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheTTL) {
      return data; // return cached data if still valid
    }
  }

  // 2️⃣ Fetch new data from NewsData.io
  const query = encodeURIComponent(`${region} agriculture OR crops OR weather`);
  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${region}&category=agriculture&language=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsData API error: ${res.statusText}`);

    const json = await res.json();
    const articles = json.results || []; // NewsData.io returns `results` array

    // 3️⃣ Store in cache
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: articles, timestamp: Date.now() })
    );

    return articles;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return []; // fallback to empty array
  }
};
