import React from 'react';
import { Tabs } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Chrome as Home, Calendar, Upload, Ticket, User, QrCode } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRef, useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function TabLayout() {
  const { t } = useI18n();
  const { getUnreadChatsCount } = useChat();
  const { isBusinessAccount } = useAuth();
  
  const unreadCount = getUnreadChatsCount();
  const translateY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  // Create animated style for tab bar
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Function to handle scroll events from child components
  const handleScroll = (scrollY: number) => {
    const currentScrollY = scrollY;
    const diff = currentScrollY - lastScrollY.current;
    
    // Only react to significant scroll changes and when scrolled past threshold
    if (Math.abs(diff) > 10 && currentScrollY > 50) {
      if (diff > 0 && !isHidden.current) {
        // Scrolling down - hide tab bar
        isHidden.current = true;
        translateY.value = withTiming(100, { duration: 300 });
      } else if (diff < 0 && isHidden.current) {
        // Scrolling up - show tab bar
        isHidden.current = false;
        translateY.value = withTiming(0, { duration: 300 });
      }
    } else if (currentScrollY <= 50 && isHidden.current) {
      // Show tab bar when near top
      isHidden.current = false;
      translateY.value = withTiming(0, { duration: 300 });
    }
    
    lastScrollY.current = currentScrollY;
  };

  // Make scroll handler available globally
  useEffect(() => {
    global.tabBarScrollHandler = handleScroll;
    
    return () => {
      delete global.tabBarScrollHandler;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: 'none', // COMPLETELY HIDE the default tab bar
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('home'),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: t('events'),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: 'رفع ملف',
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: t('bookings'),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile'),
          }}
        />
      </Tabs>

      {/* Custom Animated Tab Bar */}
      <Animated.View style={[
        styles.tabBar,
        animatedTabBarStyle
      ]}>
        <TabBarButton 
          name="index" 
          title={t('home')} 
          icon={<Home size={24} />}
        />
        <TabBarButton 
          name="events" 
          title={t('events')} 
          icon={<Calendar size={24} />}
        />
        <TabBarButton 
          name="upload" 
          title="رفع ملف" 
          icon={<Upload size={24} />}
          isSpecial
        />
        <TabBarButton 
          name="bookings" 
          title={t('bookings')} 
          icon={<Ticket size={24} />}
        />
        <TabBarButton 
          name="profile" 
          title={t('profile')} 
          icon={<User size={24} />}
        />
      </Animated.View>

      {/* Floating Scanner Button - Only visible for business accounts */}
      {isBusinessAccount() && (
        <TouchableOpacity
          style={styles.scannerButton}
          onPress={() => require('expo-router').router.push('/scanner')}
          activeOpacity={0.7}
        >
          <QrCode size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Custom Tab Bar Button Component
function TabBarButton({ 
  name, 
  title, 
  icon, 
  isSpecial = false 
}: { 
  name: string; 
  title: string; 
  icon: React.ReactElement; 
  isSpecial?: boolean;
}) {
  const handlePress = () => {
    // Use expo-router navigation
    if (name === 'index') {
      require('expo-router').router.push('/(tabs)/');
    } else {
      require('expo-router').router.push(`/(tabs)/${name}`);
    }
  };

  // Get current route to determine if active
  const segments = require('expo-router').useSegments();
  const isActive = segments[segments.length - 1] === name || 
                  (name === 'index' && segments[segments.length - 1] === '(tabs)');

  const color = isActive ? '#A855F7' : '#6B7280';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      {isSpecial ? (
        <View style={[
          styles.specialIcon,
          {backgroundColor: color === '#A855F7' ? '#A855F7' : '#F3F4F6'}
        ]}>
          {React.cloneElement(icon, { 
            color: color === '#A855F7' ? 'white' : '#6B7280',
            size: 20
          })}
        </View>
      ) : (
        <View style={styles.iconContainer}>
          {React.cloneElement(icon, { color, size: 24 })}
        </View>
      )}
      <Text style={[styles.tabText, { color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 8,
    paddingTop: 8,
    height: 88,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  specialIcon: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
  },
  scannerButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1001,
  },
});