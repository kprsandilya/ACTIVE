import { useState, useEffect } from 'react';
import {
  View,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Polygon, Marker, LatLng } from 'react-native-maps';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'expo-router';

type Field = {
  id: string;
  name: string;
  crop_type: string | null;
  geom: {
    type: 'Polygon';
    coordinates: number[][][];
  };
};

export default function FieldScreen() {
  const [points, setPoints] = useState<LatLng[]>([]);
  const [fieldName, setFieldName] = useState('');
  const [cropType, setCropType] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [drawMode, setDrawMode] = useState(true); // true = drawing, false = selecting

  const router = useRouter();

  const getUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (drawMode) {
      // Add vertex only in draw mode
      setPoints([...points, coordinate]);
      setSelectedField(null); // deselect any field while drawing
    }
  };

  const pointsToGeoJSON = (pts: LatLng[]) => ({
    type: 'Polygon',
    coordinates: [
      [...pts.map(p => [p.longitude, p.latitude]), [pts[0].longitude, pts[0].latitude]],
    ],
  });

  const saveField = async () => {
    if (!fieldName || points.length < 3) {
      return Alert.alert('Error', 'Enter a name and at least 3 points for the polygon.');
    }

    const geoJson = pointsToGeoJSON(points);
    const userId = await getUserId();
    if (!userId) return Alert.alert('Error', 'User not found');

    const { data, error } = await supabase
      .from<Field>('fields')
      .insert([{ user_id: userId, name: fieldName, crop_type: cropType, geom: geoJson }])
      .select();

    if (error) return Alert.alert('Error saving field', error.message);

    const fieldId = data?.[0]?.id;
    if (!fieldId) return;

    setPoints([]);
    setFieldName('');
    setCropType('');

    router.push(`/add-data?fieldId=${fieldId}`);
    fetchFields();
  };

  const fetchFields = async () => {
    const userId = await getUserId();
    if (!userId) return;

    const { data, error } = await supabase.from<Field>('fields').select('*').eq('user_id', userId);
    if (error) return console.log(error);
    setFields(data || []);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 42.028,
          longitude: -93.631,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Polygon being drawn */}
        {points.length > 0 && (
          <Polygon coordinates={points} fillColor="rgba(0,150,0,0.3)" strokeColor="green" />
        )}
        {points.map((p, i) => (
          <Marker key={i} coordinate={p} />
        ))}

        {/* Saved fields */}
        {fields.map(field => {
          const coords = field.geom.coordinates[0].map(c => ({
            latitude: c[1],
            longitude: c[0],
          }));
          return (
            <Polygon
              key={field.id}
              coordinates={coords}
              fillColor={selectedField?.id === field.id ? 'rgba(255,165,0,0.4)' : 'rgba(0,0,255,0.3)'}
              strokeColor={selectedField?.id === field.id ? 'orange' : 'blue'}
              tappable
              onPress={() => !drawMode && setSelectedField(field)}
            />
          );
        })}
      </MapView>

      {/* Details panel */}
      {selectedField && (
        <View style={styles.detailsPanel}>
          <ScrollView>
            <Text style={styles.detailTitle}>{selectedField.name}</Text>
            <Text>Crop Type: {selectedField.crop_type || 'N/A'}</Text>
            <Text>Field ID: {selectedField.id}</Text>
            <Button title="Close" onPress={() => setSelectedField(null)} />
          </ScrollView>
        </View>
      )}

      {/* Form & controls */}
      <View style={styles.form}>
        <View style={styles.buttonRow}>
          <Button
            title={drawMode ? 'Switch to Select Mode' : 'Switch to Draw Mode'}
            onPress={() => {
              setDrawMode(!drawMode);
              setSelectedField(null);
            }}
          />
        </View>
        {drawMode && (
          <>
            <TextInput
              placeholder="Field name"
              value={fieldName}
              onChangeText={setFieldName}
              style={styles.input}
            />
            <TextInput
              placeholder="Crop type"
              value={cropType}
              onChangeText={setCropType}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button title="Save Field" onPress={saveField} />
              <Button title="Clear Polygon" color="#d9534f" onPress={() => setPoints([])} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 12,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 80, // raised above form
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: 200,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
});
