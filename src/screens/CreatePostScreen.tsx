import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { decode } from 'base64-arraybuffer';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();

  const characterLimit = 500;
  const remainingChars = characterLimit - content.length;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to add images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      
      const base64Data = await base64Promise;
      
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, decode(base64Data), {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Empty Post', 'Please add some content or an image');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    dismissKeyboard();
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
        if (!imageUrl) {
          Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        author_name: user.name,
        content: content.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      setContent('');
      setImageUri(null);
      Alert.alert('Success', 'Your post has been shared!', [
        { text: 'OK', onPress: () => {} }
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Character count */}
            <View style={styles.topBar}>
              <Text style={[styles.characterCount, { 
                color: remainingChars < 50 ? colors.error : colors.textSecondary 
              }]}>
                {remainingChars} characters remaining
              </Text>
            </View>

            {/* Text Input */}
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={characterLimit}
              textAlignVertical="top"
              returnKeyType="default"
              blurOnSubmit={true}
            />

            {/* Image Preview */}
            {imageUri && (
              <TouchableWithoutFeedback>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity 
                    style={[styles.removeButton, { backgroundColor: colors.error }]} 
                    onPress={removeImage}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                }]} 
                onPress={pickImage}
                disabled={loading}
              >
                <Ionicons name="image" size={24} color={colors.primary} />
                <Text style={[styles.imageButtonText, { color: colors.text }]}>
                  {imageUri ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.postButton, { 
                  backgroundColor: colors.primary,
                  opacity: (!content.trim() && !imageUri) || loading ? 0.5 : 1,
                }]}
                onPress={handlePost}
                disabled={(!content.trim() && !imageUri) || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={20} color={colors.background} />
                    <Text style={[styles.postButtonText, { color: colors.background }]}>
                      Share Post
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <TouchableWithoutFeedback>
              <View style={[styles.tipsContainer, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="bulb-outline" size={20} color={colors.textSecondary} />
                <View style={styles.tipsTextContainer}>
                  <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips for great posts</Text>
                  <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                    • Be authentic and share your thoughts{'\n'}
                    • Add high-quality images{'\n'}
                    • Keep it concise and engaging
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  topBar: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  characterCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    minHeight: 180,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionContainer: {
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  tipsTextContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
});