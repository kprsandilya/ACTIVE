import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';

export const fetchNewsForRegion = async (region: string, forceRefresh = false) => {
  const cacheKey = `news_${region}`;
  const cacheTTL = 12 * 60 * 60 * 1000; // 12 hours
  const fallbackThumbnail = 'https://via.placeholder.com/150'; // default image

  if (!forceRefresh) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) return data;
    }
  }

  try {
    // Google News RSS for agriculture in the region
    const query = encodeURIComponent(`${region} agriculture`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const res = await axios.get(url);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const json = parser.parse(res.data);

    const items = json.rss.channel.item || [];
    const articles = items.map((item: any) => {
      // Attempt to get the thumbnail
      let thumbnail = fallbackThumbnail;
      if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) {
        thumbnail = item['media:thumbnail']['@_url'];
      } else if (item['media:content'] && item['media:content']['@_url']) {
        thumbnail = item['media:content']['@_url'];
      }

      return {
        title: item.title,
        url: item.link,
        pubDate: item.pubDate,
        source: item.source || '',
        thumbnail, // always has a value now
      };
    });

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
