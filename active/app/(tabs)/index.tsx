import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

const API_BASE_URL = "http://172.20.10.2:8000/api";
const HEADER_CONTENT_OFFSET = 65;
const CHAT_FLEX_RATIO = 1;

function LandingScreenContent() {
  const insets = useSafeAreaInsets();
  const [conversation, setConversation] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasConversationStarted, setHasConversationStarted] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const outputOpacity = useRef(new Animated.Value(0)).current;
  const isInputEmpty = !inputText.trim();

  const showOutputArea = () => {
    Animated.timing(outputOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setHasConversationStarted(true);
      scrollToBottom();
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ---- TEXT INPUT ----
  const handleSendText = async () => {
    if (isInputEmpty) return;

    const userMessage = inputText;
    setInputText('');

    if (conversation.length === 0) showOutputArea();
    setConversation(prev => [...prev, `You: ${userMessage}`]);

    try {
      const res = await fetch(`${API_BASE_URL}/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userMessage }),
      });

      const data = await res.json();
      setConversation(prev => [...prev, data.reply]);
    } catch (err) {
      console.error("Text send error:", err);
      setConversation(prev => [...prev, "⚠️ Error: Could not reach server."]);
    }

    scrollToBottom();
  };

  // ---- VOICE INPUT ----
  const recordAudio = async (): Promise<string> => {
    // Ask for permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') throw new Error('Permission denied');

    // Enable recording mode on iOS
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Prepare the recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });

    await recording.startAsync();

    // Example: record for 5 seconds
    await new Promise(res => setTimeout(res, 5000));

    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    if (!uri) throw new Error('Recording failed');
    return uri;
  };

  const handleVoiceInput = async () => {
    if (conversation.length === 0) showOutputArea();
    setIsRecording(true);

    try {
      const uri = await recordAudio();
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice_input.wav",
        type: "audio/wav",
      } as any);

      setConversation(prev => [...prev, "Recording sent for processing..."]);

      const res = await fetch(`${API_BASE_URL}/voice`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setConversation(prev => [...prev, data.reply]);
    } catch (err) {
      console.error("Voice send error:", err);
      setConversation(prev => [...prev, "⚠️ Error: Could not record or send audio."]);
    } finally {
      setIsRecording(false);
      scrollToBottom();
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + HEADER_CONTENT_OFFSET, paddingBottom: 50 }]}>
      <Text style={styles.appName}>🌿 **ACTIVE**</Text>

      <KeyboardAvoidingView style={styles.assistantContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!hasConversationStarted && (
          <View style={styles.welcomeContainer}>
            <Ionicons name="leaf-outline" size={48} color="#2E7D32" />
            <Text style={styles.welcomeText}>Ask **ACTIVE** for advice on your farm or livestock.</Text>
            <Text style={styles.welcomeSubText}>
              E.g., "Which fertilizer or pesticide would save me money for my crops?"  
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.conversationBox,
            { flex: hasConversationStarted ? CHAT_FLEX_RATIO : 0, opacity: outputOpacity },
          ]}
        >
          <ScrollView ref={scrollRef} style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
            {conversation.map((msg, idx) => {
              const isUser = msg.startsWith('You:');
              return (
                <View
                  key={idx}
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}
                  >
                    {msg.replace(/^You: /, '')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask ACTIVE about your farm..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendText}
            placeholderTextColor="#999"
            multiline
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isInputEmpty ? handleVoiceInput : handleSendText}
            disabled={isRecording}
          >
            <Ionicons
              name={isInputEmpty ? (isRecording ? 'mic-off' : 'mic') : 'paper-plane'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

export default function LandingScreen() {
  return (
    <SafeAreaProvider style={styles.fullScreen}>
      <LandingScreenContent />
    </SafeAreaProvider>
  );
}

// keep your existing styles here...


const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#F7FFF7' },
  container: { flex: 1, backgroundColor: '#F7FFF7', alignItems: 'center', paddingHorizontal: 12 },
  appName: { fontSize: 42, fontWeight: '800', marginBottom: 16, color: '#2E7D32', textAlign: 'center' },
  assistantContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'flex-end',
  },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#EAF4EA', borderRadius: 18, marginBottom: 20 },
  welcomeText: { fontSize: 18, fontWeight: '600', color: '#2E7D32', marginTop: 12, textAlign: 'center' },
  welcomeSubText: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  conversationBox: { marginBottom: 12, overflow: 'hidden' },
  scrollView: { flex: 1 },
  scrollContentContainer: { paddingVertical: 12 },
  messageBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%', minWidth: '20%' },
  userBubble: { backgroundColor: '#4CAF50', alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  assistantBubble: { backgroundColor: '#EAF4EA', alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff', fontWeight: '500' },
  assistantText: { color: '#333' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 8, paddingBottom: 12 },
  input: { flex: 1, backgroundColor: '#F0F4F8', paddingVertical: Platform.OS === 'ios' ? 12 : 10, paddingHorizontal: 16, borderRadius: 26, fontSize: 16, maxHeight: 120, minHeight: 48, borderColor: '#ddd', borderWidth: 1 },
  actionButton: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 26, justifyContent: 'center', alignItems: 'center', shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 4 },
});
