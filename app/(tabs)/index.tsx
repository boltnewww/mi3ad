import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents, Event } from '@/context/EventContext';
import { useNotifications } from '@/context/NotificationContext';
import { useFriends } from '@/context/FriendsContext';
import { router } from 'expo-router';
import { Search, MapPin, Calendar, Users, Building2, GraduationCap, Heart, PartyPopper, Clapperboard, Ribbon, Bell, MessageCircle, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import StoriesSection from '@/components/StoriesSection';
import * as Location from 'expo-location';
import { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  runOnJS, 
  useDerivedValue, 
  withTiming, 
  withSpring, 
  withSequence, 
  withDelay,
  interpolate 
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

const categoryIcons = {
  government: Building2,
  schools: GraduationCap,
  clinics: Heart,
  occasions: PartyPopper,
  entertainment: Clapperboard,
  openings: Ribbon,
};

const { height, width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t, isRTL, locale } = useI18n();
  const { theme } = useTheme();
  const { events, getFeaturedEvents, getNearbyEvents, searchEvents } = useEvents();
  const { unreadCount } = useNotifications();
  const { getPendingRequestsCount } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  // Animation values for falling logo using Reanimated
  const logoFallAnim = useSharedValue(-300);
  const logoScaleAnim = useSharedValue(0.5);
  const logoOpacityAnim = useSharedValue(0);
  const logoRotateAnim = useSharedValue(0);

  // Scroll animation values
  const scrollY = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Create a unified scroll handler that works on all platforms
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Call the global tab bar scroll handler if it exists
    if (global.tabBarScrollHandler) {
      global.tabBarScrollHandler(scrollY);
    }
    
    // Show language switcher when scrolled down a bit
    setShowLanguageSwitcher(scrollY > 50);
  };

  useEffect(() => {
    getLocationPermission();
    setFeaturedEvents(getFeaturedEvents());
    
    // Start the falling animation
    startFallingAnimation();
    
    // Start content fade-in after logo animation
    setTimeout(() => {
      contentOpacity.value = withTiming(1, { duration: 800 });
    }, 1500);
  }, []);

  useEffect(() => {
    if (location) {
      const nearby = getNearbyEvents(
        location.coords.latitude,
        location.coords.longitude,
        50 // 50km radius
      );
      setNearbyEvents(nearby);
    }
  }, [location]);

  const startFallingAnimation = () => {
    // Reset animation values
    logoFallAnim.value = -300;
    logoScaleAnim.value = 0.5;
    logoOpacityAnim.value = 0;
    logoRotateAnim.value = 0;

    // Create the falling animation sequence
    logoOpacityAnim.value = withTiming(1, { duration: 300 });
    
    logoFallAnim.value = withDelay(300, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));
    
    logoScaleAnim.value = withDelay(300, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
    
    logoRotateAnim.value = withDelay(300, withTiming(1, { duration: 1200 }));
    
    // Small bounce at the end
    logoScaleAnim.value = withDelay(1500, withSequence(
      withSpring(1.05, { damping: 20, stiffness: 300 }),
      withSpring(1, { damping: 20, stiffness: 300 })
    ));
  };

  const getLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const categories = [
    { key: 'government', name: t('government'), icon: categoryIcons.government },
    { key: 'schools', name: t('schools'), icon: categoryIcons.schools },
    { key: 'clinics', name: t('clinics'), icon: categoryIcons.clinics },
    { key: 'occasions', name: t('occasions'), icon: categoryIcons.occasions },
    { key: 'entertainment', name: t('entertainment'), icon: categoryIcons.entertainment },
    { key: 'openings', name: t('openings'), icon: categoryIcons.openings },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchEvents(searchQuery);
      router.push({
        pathname: '/events',
        params: { search: searchQuery }
      });
    }
  };

  // Derived values for interpolations
  const rotateInterpolate = useDerivedValue(() => {
    return `${interpolate(logoRotateAnim.value, [0, 1], [0, 360])}deg`;
  });

  // Parallax interpolations for header
  const headerTranslateY = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 150], [0, -75], 'clamp');
  });

  const headerScale = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 150], [1, 0.85], 'clamp');
  });

  const headerOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 100, 150], [1, 0.8, 0.6], 'clamp');
  });

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  const handleMessagesPress = () => {
    router.push('/chat');
  };

  const handleFriendsPress = () => {
    router.push('/friends');
  };

  const renderEventCard = (event: Event, isHorizontal = false) => {
    const title = locale === 'ar' ? event.titleAr : event.title;
    const location = locale === 'ar' ? event.locationAr : event.location;
    const organizer = locale === 'ar' ? event.organizerAr : event.organizer;

    const CategoryIcon = categoryIcons[event.category];

    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, isHorizontal && styles.eventCardHorizontal]}
        onPress={() => router.push(`/event/${event.id}`)}
      >
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            <View style={styles.categoryContainer}>
              <CategoryIcon size={14} color={theme.colors.primary} />
              <Text style={[styles.eventCategory, { color: theme.colors.textSecondary }]}>
                {categories.find(c => c.key === event.category)?.name}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.eventPrice}>
                {event.price === 0 ? t('free') : `${event.price} د.ل`}
              </Text>
            </View>
          </View>
          <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={2}>{title}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Calendar size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                {new Date(event.date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-US')}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <MapPin size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{location}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Users size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.eventDetailText, { color: theme.colors.textSecondary }]}>
                {event.currentAttendees}/{event.maxAttendees}
              </Text>
            </View>
          </View>
          <Text style={[styles.eventOrganizer, { color: theme.colors.textSecondary }]} numberOfLines={1}>{organizer}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: 88, // Add padding for tab bar
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    headerContainer: {
      marginBottom: 20,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingTop: 8,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerButton: {
      position: 'relative',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: '#FF3040',
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 10,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: -40,
      height: 180,
    },
    headerLogo: {
      width: 600,
      height: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    headerContent: {
      flex: 1,
    },
    welcomeSection: {
      marginBottom: 16,
    },
    greeting: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: 'white',
      marginBottom: 4,
      textAlign: 'right',
    },
    subGreeting: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'right',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.text,
    },
    searchInputRTL: {
      textAlign: 'right',
    },
    contentContainer: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
    },
    seeAllText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.primary,
    },
    categoriesContainer: {
      paddingRight: 20,
    },
    categoryCard: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderRadius: 16,
      alignItems: 'center',
      marginRight: 12,
      minWidth: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryIcon: {
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 12,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    eventsContainer: {
      paddingRight: 20,
    },
    eventsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    eventCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    eventCardHorizontal: {
      width: 280,
      marginRight: 16,
    },
    eventImage: {
      width: '100%',
      height: 140,
      backgroundColor: theme.colors.border,
    },
    eventInfo: {
      padding: 16,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    eventCategory: {
      fontSize: 12,
      fontFamily: 'Cairo-SemiBold',
    },
    priceContainer: {
      backgroundColor: theme.isDark ? 'rgba(168, 85, 247, 0.2)' : '#DDD6FE',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    eventPrice: {
      fontSize: 12,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.primary,
    },
    eventTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      marginBottom: 12,
      lineHeight: 22,
    },
    eventDetails: {
      gap: 6,
      marginBottom: 8,
    },
    eventDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    eventDetailText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      flex: 1,
    },
    eventOrganizer: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      fontStyle: 'italic',
      opacity: 0.7,
    },
    // Fixed Language Switcher Position
    languageSwitcherContainer: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 1000,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Language Switcher - Only show when scrolled */}
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher visible={showLanguageSwitcher} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              transform: [
                { translateY: headerTranslateY },
                { scale: headerScale },
              ],
              opacity: headerOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={theme.colors.gradient}
            style={styles.header}
          >
            {/* Header Top Row with Social Icons */}
            <View style={styles.headerTopRow}>
              <View style={styles.headerLeft}>
                {/* Notifications */}
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleNotificationsPress}
                  activeOpacity={0.7}
                >
                  <Bell size={20} color="white" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Messages */}
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleMessagesPress}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={20} color="white" />
                </TouchableOpacity>

                {/* Friend Requests */}
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={handleFriendsPress}
                  activeOpacity={0.7}
                >
                  <UserPlus size={20} color="white" />
                  {getPendingRequestsCount() > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>{getPendingRequestsCount()}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Animated Logo */}
            <View style={styles.logoContainer}>
              <Animated.Image
                source={require('@/assets/images/mi3ad new logo.png')}
                style={[
                  styles.headerLogo,
                  {
                    transform: [
                      { translateY: logoFallAnim },
                      { scale: logoScaleAnim },
                      { rotate: rotateInterpolate },
                    ],
                    opacity: logoOpacityAnim,
                  }
                ]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>اكتشف أفضل الفعاليات في ليبيا</Text>
                <Text style={styles.subGreeting}>انضم إلى آلاف المشاركين في أهم الأحداث</Text>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, isRTL && styles.searchInputRTL]}
                  placeholder={t('searchEvents')}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stories Section */}
        <StoriesSection />

        {/* Animated Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('categories')}</Text>
            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
              {categories.map((category) => {
                const CategoryIcon = category.icon;
                
                return (
                  <TouchableOpacity
                    key={category.key}
                    style={styles.categoryCard}
                    onPress={() => router.push({
                      pathname: '/events',
                      params: { category: category.key }
                    })}
                  >
                    <CategoryIcon 
                      size={32} 
                      color={theme.colors.primary}
                      style={styles.categoryIcon}
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.ScrollView>
          </View>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('featuredEvents')}</Text>
                <TouchableOpacity onPress={() => router.push('/events')}>
                  <Text style={styles.seeAllText}>عرض الكل</Text>
                </TouchableOpacity>
              </View>
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsContainer}>
                {featuredEvents.map((event) => renderEventCard(event, true))}
              </Animated.ScrollView>
            </View>
          )}

          {/* Nearby Events */}
          {nearbyEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('nearbyEvents')}</Text>
                <TouchableOpacity onPress={() => router.push('/events')}>
                  <Text style={styles.seeAllText}>عرض الكل</Text>
                </TouchableOpacity>
              </View>
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsContainer}>
                {nearbyEvents.slice(0, 5).map((event) => renderEventCard(event, true))}
              </Animated.ScrollView>
            </View>
          )}

          {/* All Events Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أحدث الفعاليات</Text>
              <TouchableOpacity onPress={() => router.push('/events')}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventsGrid}>
              {events.slice(0, 4).map((event) => renderEventCard(event))}
            </View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}