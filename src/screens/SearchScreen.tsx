import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { Post } from '../types';
import PostCard from '../components/PostCard';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const debounce = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);

      return () => clearTimeout(debounce);
    } else {
      setResults([]);
      setSearching(false);
    }
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery) return;

      let updated = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)];
      updated = updated.slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    setLoading(true);

    try {
      // Search in post content and author names
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`content.ilike.%${query}%,author_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setResults(data || []);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderRecentSearches = () => {
    if (searchQuery.trim().length > 0 || recentSearches.length === 0) {
      return null;
    }

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Searches</Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={[styles.clearButton, { color: colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.recentItem, { borderBottomColor: colors.border }]}
            onPress={() => handleRecentSearchPress(search)}
          >
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.recentText, { color: colors.text }]}>{search}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (!searching) {
      return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.centerContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.inputBackground }]}>
              <Ionicons name="search" size={60} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>Search Framez</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Find posts by content or author name
            </Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching...</Text>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search-outline" size={60} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>No results found</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Try searching for something else
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search posts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              returnKeyType="search"
              onSubmitEditing={dismissKeyboard}
              blurOnSubmit={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setResults([]);
                  setSearching(false);
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results / Recent Searches */}
        {searchQuery.trim().length === 0 ? (
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.content}>
              {renderRecentSearches()}
              {recentSearches.length === 0 && renderEmptyState()}
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PostCard post={item} showActions={false} />}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={results.length === 0 ? styles.emptyList : styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={dismissKeyboard}
          />
        )}

        {/* Search Stats */}
        {searching && results.length > 0 && (
          <TouchableOpacity 
            style={[styles.statsBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
            onPress={dismissKeyboard}
            activeOpacity={1}
          >
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              Found {results.length} {results.length === 1 ? 'post' : 'posts'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  recentSection: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  statsBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
  },
});