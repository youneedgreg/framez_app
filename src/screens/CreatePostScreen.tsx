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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { decode } from 'base64-arraybuffer';

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
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
      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Convert blob to base64
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
      
      // Generate unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, decode(base64Data), {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Error', 'Please add some content or an image');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
        if (!imageUrl) {
          Alert.alert('Error', 'Failed to upload image');
          setLoading(false);
          return;
        }
      }

      // Create post
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        author_name: user.name,
        content: content.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      // Reset form
      setContent('');
      setImageUri(null);
      Alert.alert('Success', 'Post created successfully!');
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Ionicons name="close-circle" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="image" size={24} color="#000" />
            <Text style={styles.imageButtonText}>
              {imageUri ? 'Change Image' : 'Add Image'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  input: {
    fontSize: 16,
    minHeight: 150,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  imageButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});