import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { supabase } from '../src/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert("Sign-up error", error.message);
    else Alert.alert("Check your email to confirm!");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Login error", error.message);
  };

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Welcome</Text>
      <TextInput placeholder="email" autoCapitalize="none" value={email} onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12 }} />
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 12 }} />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Sign Up" onPress={signUp} />
    </View>
  );
}
