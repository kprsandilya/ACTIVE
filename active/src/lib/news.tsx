import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';

export const fetchNewsForRegion = async (region: string, forceRefresh = false) => {
  const cacheKey = `news_${region}`;
  const cacheTTL = 12 * 60 * 60 * 1000; // 12 hours
  const placeholderThumbnail =
    'https://www.publicdomainpictures.net/pictures/270000/velka/news-placeholder.jpg'; // permanent placeholder

  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) return data;
    }
  }

  try {
    const query = encodeURIComponent(`${region} agriculture`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const res = await axios.get(url);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const json = parser.parse(res.data);

    const items = json.rss.channel.item || [];
    const articles = items.slice(0, 20).map((item: any) => ({
      title:
        typeof item.title === 'string'
          ? item.title
          : item.title?.['#text'] || '',
      source:
        typeof item.source === 'string'
          ? item.source
          : item.source?.['#text'] || '',
      url: item.link || '#',
      pubDate: item.pubDate || '',
      thumbnail: placeholderThumbnail, // always use placeholder
    }));

    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: articles, timestamp: Date.now() })
    );

    return articles;
  } catch (err) {
    console.error('Failed to fetch news:', err);
    return [];
  }
};
