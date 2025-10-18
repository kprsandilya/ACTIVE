import { View, Dimensions } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;

  // Dummy polygons
  const userPolygon = [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4324 },
    { latitude: 37.78925, longitude: -122.4314 },
    { latitude: 37.78825, longitude: -122.4314 },
  ];

  const surroundingPolygons = [
    [
      { latitude: 37.78725, longitude: -122.4334 },
      { latitude: 37.78825, longitude: -122.4334 },
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78725, longitude: -122.4324 },
    ],
    [
      { latitude: 37.78625, longitude: -122.4314 },
      { latitude: 37.78725, longitude: -122.4314 },
      { latitude: 37.78725, longitude: -122.4304 },
      { latitude: 37.78625, longitude: -122.4304 },
    ],
  ];

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polygon
          coordinates={userPolygon}
          fillColor="rgba(0, 150, 255, 0.3)"
          strokeColor="blue"
          strokeWidth={2}
        />
        {surroundingPolygons.map((poly, i) => (
          <Polygon
            key={i}
            coordinates={poly}
            fillColor="rgba(255, 0, 0, 0.3)"
            strokeColor="red"
            strokeWidth={1}
          />
        ))}
      </MapView>
    </View>
  );
}
