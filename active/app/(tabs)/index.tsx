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
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; 

// Define the proportional size for the chat area when it's visible
const CHAT_FLEX_RATIO = 1; 

// FIX: Expanded the Sample Responses array
const SAMPLE_VOICE_RESPONSES = [
  {
    user: 'What action should I take today to better my plants?',
    assistant: 'Hi! According to the recent climate in the Iowa region, it is recommended to plan for heavy rains and be ready for heavy gusts as winds exceed 20 mph.',
  },
  {
    user: 'Is the soil moisture level optimal?',
    assistant: 'The current soil moisture reading is 35%. While acceptable, I recommend initiating light drip irrigation for two hours in the north field tomorrow morning.',
  },
  {
    user: 'What\'s my livestock feed inventory look like?',
    assistant: 'You currently have 4 days of finished feed for the cattle herd. Please schedule a resupply order to be delivered by the end of the week.',
  },
  {
    user: 'Should I apply pesticide to the south field today?',
    assistant: 'Negative. Pest levels are below the critical threshold. Recheck in 48 hours, but no immediate spraying is necessary, which saves you cost and labor.',
  },
  {
    user: 'What is the projected yield for my wheat crop?',
    assistant: 'Based on current biomass data and historical weather, the projected yield is 65 bushels per acre, which is 5% above the regional average. Excellent work!',
  },
  {
    user: 'Remind me to check the irrigation pump status.',
    assistant: 'Reminder set! I will notify you in 3 hours to check the pressure and flow rate on irrigation pump unit 4.',
  },
];


// Component that uses the safe area hook
function LandingScreenContent() {
  const insets = useSafeAreaInsets(); // Dynamically get the required top safe area inset

  const [conversation, setConversation] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasConversationStarted, setHasConversationStarted] = useState(false);
  // State variable to track and cycle through voice prompts
  const [voicePromptCount, setVoicePromptCount] = useState(0); 

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
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendText = () => {
    if (isInputEmpty) return;

    //Make sure this is manually inputted: Tell me about the market price for corn.

    const userMessage = inputText;
    const assistantReply = `Corn futures are up 1.5% this morning due to supply concerns. The current price is around $4.50 per bushel. Hold until the next report.`;

    if (conversation.length === 0) showOutputArea();

    setConversation(prev => [...prev, `You: ${userMessage}`, assistantReply]);
    setInputText('');
    scrollToBottom();
  };

  const handleVoiceInput = async () => {
    if (conversation.length === 0) showOutputArea();

    setIsRecording(true);
    
    // Get the next response set, cycling back to the start if we reach the end
    const nextIndex = voicePromptCount % SAMPLE_VOICE_RESPONSES.length;
    const { user, assistant } = SAMPLE_VOICE_RESPONSES[nextIndex];
    
    setTimeout(() => {
      // Use the dynamic content for the simulated response
      const userMessage = `You: ${user}`;
      const assistantReply = assistant;
      
      setConversation(prev => [...prev, userMessage, assistantReply]);
      
      setIsRecording(false);
      // Increment the count for the next call
      setVoicePromptCount(prev => prev + 1); 
      scrollToBottom();
    }, 3000);
  };

  return (
    // Apply dynamic top padding (insets.top + 16) AND bottom padding (50) to the main container
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 50 }]}>
        {/* App Name at the top */}
        <Text style={styles.appName}>🌿 **ACTIVE**</Text>

        <KeyboardAvoidingView
          style={styles.assistantContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Welcome Message: Fills space when chat is hidden */}
          {!hasConversationStarted && (
            <View style={styles.welcomeContainer}>
              <Ionicons name="leaf-outline" size={48} color="#2E7D32" />
              <Text style={styles.welcomeText}>
                Ask **ACTIVE** about your farm or livestock.
              </Text>
              <Text style={styles.welcomeSubText}>
                E.g., "What's the best time to harvest my corn?"
              </Text>
            </View>
          )}

          {/* Assistant Output: Dynamically sized and hidden/shown */}
          <Animated.View 
            style={[
              styles.conversationBox, 
              // The flex value is now 1 when the conversation starts
              { flex: hasConversationStarted ? CHAT_FLEX_RATIO : 0, opacity: outputOpacity }
            ]}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContentContainer}
            >
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
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {msg.replace(/^You: /, '')}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Input Area */}
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

// Export the component wrapped in SafeAreaProvider
export default function LandingScreen() {
    return (
        <SafeAreaProvider style={styles.fullScreen}>
            <LandingScreenContent />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  fullScreen: {
      flex: 1,
      backgroundColor: '#F7FFF7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FFF7',
    // paddingTop and paddingBottom are set dynamically in the component
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 16,
    color: '#2E7D32',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  assistantContainer: {
    flex: 1, // Ensures it takes up all vertical space below the title
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
  welcomeContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#EAF4EA',
    borderRadius: 18,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 12,
    textAlign: 'center',
  },
  welcomeSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  conversationBox: {
    // This now takes up flex: 1 (the remaining space) when visible
    marginBottom: 12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
    minWidth: '20%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: '#EAF4EA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff', fontWeight: '500' },
  assistantText: { color: '#333' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 8,
    paddingBottom: 12
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 16,
    borderRadius: 26,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
});