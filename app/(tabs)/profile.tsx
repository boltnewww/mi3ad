import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useEvents } from '@/context/EventContext';
import { useSecurity } from '@/context/SecurityContext';
import { router } from 'expo-router';
import { User, Settings, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Globe, Moon, Shield, Star, Info, Phone, Mail, FileImage, Upload, CreditCard as Edit3, Bookmark, Calendar, Users, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { t, locale, changeLanguage } = useI18n();
  const { user, logout, updateProfile } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { getSavedPostsCount, getSavedEventsCount } = useFavorites();
  const { bookings } = useEvents();
  const { securitySettings, isOnline, setOnlineStatus } = useSecurity();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(true);
  const scrollY = useSharedValue(0);

  // Memoize styles to prevent initialization issues
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingBottom: 88, // Add padding for tab bar
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
    },
    userProfile: {
      backgroundColor: theme.colors.surface,
      marginTop: 16,
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.secondary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    userName: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    userBio: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 12,
    },
    userDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    userDetailText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
    },
    editProfileButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    editProfileButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
    menuSection: {
      marginTop: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    menuContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    menuItemTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      flex: 1,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
    menuItemSubtitle: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
    },
    menuItemRight: {
      marginLeft: 12,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoutSection: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    logoutButton: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: '#FEE2E2',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    logoutButtonText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: '#EF4444',
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    appInfoText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    appInfoSubtext: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      opacity: 0.7,
    },
    // Fixed Language Switcher Position
    languageSwitcherContainer: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 1000,
    },
  }), [theme]);

  // Create a unified scroll handler that works on all platforms
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // Call the global tab bar scroll handler if it exists
    if (global.tabBarScrollHandler) {
      global.tabBarScrollHandler(scrollY);
    }
    
    // Hide language switcher when scrolling down
    setShowLanguageSwitcher(scrollY < 50);
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'تغيير اللغة',
      'اختر اللغة المفضلة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'العربية', 
          onPress: () => changeLanguage('ar') 
        },
        { 
          text: 'English', 
          onPress: () => changeLanguage('en') 
        },
        { 
          text: 'Français', 
          onPress: () => changeLanguage('fr') 
        },
        { 
          text: 'Русский', 
          onPress: () => changeLanguage('ru') 
        },
      ]
    );
  };

  const handleAvatarChange = async () => {
    Alert.alert(
      'تغيير الصورة الشخصية',
      'اختر مصدر الصورة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الكاميرا', onPress: takePhoto },
        { text: 'المعرض', onPress: pickImage },
        ...(user?.avatar ? [{ text: 'حذف الصورة', style: 'destructive', onPress: () => removeAvatar() }] : []),
      ]
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى معرض الصور');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ avatar: result.assets[0].uri });
        Alert.alert('تم التحديث! ✅', 'تم تحديث صورتك الشخصية بنجاح');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('غير متاح', 'الكاميرا غير متاحة على الويب. يرجى استخدام خيار اختيار من المعرض.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الكاميرا');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ avatar: result.assets[0].uri });
        Alert.alert('تم التحديث! ✅', 'تم تحديث صورتك الشخصية بنجاح');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('خطأ', 'فشل في التقاط الصورة');
    }
  };

  const removeAvatar = async () => {
    try {
      await updateProfile({ avatar: '' });
      Alert.alert('تم الحذف', 'تم حذف صورتك الشخصية');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في حذف الصورة');
    }
  };

  // Get user's bookings count
  const userBookingsCount = bookings.filter(booking => booking.userId === user?.id).length;

  const contentMenuItems = [
    {
      icon: FileImage,
      title: 'منشوراتي',
      subtitle: 'عرض وإدارة الصور والملفات المرفوعة',
      action: () => router.push('/my-posts'),
      badge: '12', // Example count
    },
    {
      icon: Upload,
      title: 'رفع جديد',
      subtitle: 'إضافة صور أو ملفات جديدة',
      action: () => router.push('/(tabs)/upload'),
    },
    {
      icon: Bookmark,
      title: 'المحفوظات',
      subtitle: 'المنشورات والفعاليات المحفوظة',
      action: () => router.push('/saved'),
      badge: (getSavedPostsCount() + getSavedEventsCount()).toString(),
    },
    {
      icon: Calendar,
      title: 'فعالياتي المحجوزة',
      subtitle: 'عرض جميع التذاكر والحجوزات',
      action: () => router.push('/(tabs)/bookings'),
      badge: userBookingsCount.toString(),
    },
  ];

  const settingsMenuItems = [
    {
      icon: Bell,
      title: 'الإشعارات',
      subtitle: 'إدارة إشعارات التطبيق',
      action: () => router.push('/notifications'),
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
        />
      ),
    },
    {
      icon: Globe,
      title: 'اللغة',
      subtitle: `${locale === 'ar' ? 'العربية' : locale === 'en' ? 'English' : locale === 'fr' ? 'Français' : 'Русский'}`,
      action: handleLanguageChange,
    },
    {
      icon: Moon,
      title: 'الوضع الليلي',
      subtitle: isDarkMode ? 'مفعل' : 'غير مفعل',
      action: () => {},
      rightComponent: (
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
        />
      ),
    },
    {
      icon: Users,
      title: 'الحالة الإلكترونية',
      subtitle: isOnline ? 'متصل' : 'غير متصل',
      action: () => {},
      rightComponent: (
        <View style={styles.statusContainer}>
          {isOnline ? (
            <CheckCircle size={20} color={theme.colors.success} />
          ) : (
            <XCircle size={20} color={theme.colors.textSecondary} />
          )}
          <Switch
            value={isOnline}
            onValueChange={setOnlineStatus}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      ),
    },
    {
      icon: Shield,
      title: 'الأمان والخصوصية',
      subtitle: `إعدادات الخصوصية والأمان`,
      action: () => router.push('/security-privacy'),
    },
    {
      icon: Star,
      title: 'قيّم التطبيق',
      subtitle: 'شاركنا رأيك',
      action: () => {
        Alert.alert('شكراً لك', 'سيتم توجيهك لمتجر التطبيقات قريباً');
      },
    },
    {
      icon: HelpCircle,
      title: 'المساعدة والدعم',
      subtitle: 'الأسئلة الشائعة والدعم الفني',
      action: () => {},
    },
    {
      icon: Info,
      title: 'حول التطبيق',
      subtitle: 'الإصدار 1.0.0',
      action: () => {},
    },
  ];

  const renderMenuItem = (item: any, index: number) => {
    const Icon = item.icon;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.menuItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
        onPress={item.action}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.background }]}>
            <Icon size={20} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.menuItemContent}>
            <View style={styles.menuItemTitleRow}>
              <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
              {item.badge && parseInt(item.badge) > 0 && (
                <View style={[
                  styles.badge, 
                  { backgroundColor: item.badgeColor || theme.colors.primary }
                ]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.menuItemRight}>
          {item.rightComponent || <ChevronRight size={20} color={theme.colors.border} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Language Switcher */}
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher visible={showLanguageSwitcher} />
      </View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{t('profile')}</Text>
          </View>
        </View>

        {/* User Profile */}
        <View style={styles.userProfile}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="white" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleAvatarChange}>
              <Settings size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'المستخدم'}</Text>
            
            {user?.bio && (
              <Text style={styles.userBio}>{user.bio}</Text>
            )}
            
            <View style={styles.userDetail}>
              <Mail size={16} color={theme.colors.textSecondary} />
              <Text style={styles.userDetailText}>{user?.email}</Text>
            </View>
            <View style={styles.userDetail}>
              <Phone size={16} color={theme.colors.textSecondary} />
              <Text style={styles.userDetailText}>{user?.phone}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Edit3 size={16} color="white" />
            <Text style={styles.editProfileButtonText}>تعديل الملف الشخصي</Text>
          </TouchableOpacity>
        </View>

        {/* Content Management Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>المحتوى والحجوزات</Text>
          <View style={styles.menuContainer}>
            {contentMenuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          <View style={styles.menuContainer}>
            {settingsMenuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>تطبيق Mi3AD - الإصدار 1.0.0</Text>
          <Text style={styles.appInfoSubtext}>جميع الحقوق محفوظة © 2024</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}