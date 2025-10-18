import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { supabase } from '../src/lib/supabase';

type Todo = { id: number; user_id: string; title: string; done: boolean; inserted_at: string };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('todos').select('*').order('inserted_at', { ascending: false });
    if (error) Alert.alert("Load error", error.message);
    else setTodos(data || []);
  };

  const add = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from('todos').insert({ title });
    if (error) Alert.alert("Insert error", error.message);
    setTitle('');
  };

  const toggle = async (id: number, done: boolean) => {
    const { error } = await supabase.from('todos').update({ done: !done }).eq('id', id);
    if (error) Alert.alert("Update error", error.message);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('todos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Your Todos</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Add a todo"
          style={{ borderWidth: 1, padding: 12, flex: 1 }} />
        <Button title="Add" onPress={add} />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(t) => String(t.id)}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, padding: 12 }}>
            <Text>{item.title} {item.done ? '✅' : ''}</Text>
            <Button title={item.done ? "Undo" : "Done"} onPress={() => toggle(item.id, item.done)} />
          </View>
        )}
      />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
