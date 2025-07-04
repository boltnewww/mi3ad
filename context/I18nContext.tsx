import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface I18nContextType {
  i18n: I18n;
  locale: string;
  isRTL: boolean;
  t: (key: string, options?: any) => string;
  changeLanguage: (language: string) => Promise<void>;
  getSupportedLanguages: () => Array<{ code: string; name: string; nativeName: string; flag: string }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    events: 'الفعاليات',
    bookings: 'حجوزاتي',
    profile: 'الملف الشخصي',
    
    // Home Screen
    welcome: 'مرحباً بك في Mi3AD',
    searchEvents: 'ابحث عن فعالية...',
    categories: 'الفئات',
    featuredEvents: 'الفعاليات المميزة',
    nearbyEvents: 'اكتشف بالقرب منك',
    
    // Categories
    government: 'القطاعات الحكومية',
    schools: 'المدارس',
    clinics: 'المصحات',
    occasions: 'المناسبات الخاصة',
    entertainment: 'الفعاليات الترفيهية',
    openings: 'الافتتاحات',
    
    // Event Details
    eventDetails: 'تفاصيل الفعالية',
    date: 'التاريخ',
    time: 'الوقت',
    location: 'الموقع',
    price: 'السعر',
    free: 'مجاني',
    bookNow: 'احجز الآن',
    addToCalendar: 'أضف للتقويم',
    shareEvent: 'شارك الفعالية',
    
    // Booking
    booking: 'الحجز',
    tickets: 'التذاكر',
    ticketCount: 'عدد التذاكر',
    totalPrice: 'السعر الإجمالي',
    paymentMethod: 'طريقة الدفع',
    creditCard: 'البطاقة المصرفية',
    confirmBooking: 'تأكيد الحجز',
    bookingSuccess: 'تم الحجز بنجاح!',
    
    // Tickets
    myTickets: 'تذاكري',
    ticketCode: 'رمز التذكرة',
    addToWallet: 'أضف للمحفظة',
    downloadTicket: 'تحميل التذكرة',
    
    // Profile
    settings: 'الإعدادات',
    language: 'اللغة',
    notifications: 'الإشعارات',
    help: 'المساعدة',
    logout: 'تسجيل الخروج',
    
    // Schools
    schoolCommunication: 'التواصل مع المدرسة',
    contactAdmin: 'تواصل مع الإدارة',
    sendMessage: 'إرسال رسالة',
    
    // Scanner
    scanTicket: 'مسح التذكرة',
    scanCode: 'امسح الرمز',
    validTicket: 'تذكرة صالحة',
    invalidTicket: 'تذكرة غير صالحة',
    usedTicket: 'تم استخدام التذكرة مسبقاً',
    
    // Language Switcher
    selectLanguage: 'اختر اللغة',
    
    // Common
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
  },
  en: {
    // Navigation
    home: 'Home',
    events: 'Events',
    bookings: 'My Bookings',
    profile: 'Profile',
    
    // Home Screen
    welcome: 'Welcome to Mi3AD',
    searchEvents: 'Search for events...',
    categories: 'Categories',
    featuredEvents: 'Featured Events',
    nearbyEvents: 'Discover Near You',
    
    // Categories
    government: 'Government',
    schools: 'Schools',
    clinics: 'Clinics',
    occasions: 'Occasions',
    entertainment: 'Entertainment',
    openings: 'Openings',
    
    // Event Details
    eventDetails: 'Event Details',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    price: 'Price',
    free: 'Free',
    bookNow: 'Book Now',
    addToCalendar: 'Add to Calendar',
    shareEvent: 'Share Event',
    
    // Booking
    booking: 'Booking',
    tickets: 'Tickets',
    ticketCount: 'Number of Tickets',
    totalPrice: 'Total Price',
    paymentMethod: 'Payment Method',
    creditCard: 'Credit Card',
    confirmBooking: 'Confirm Booking',
    bookingSuccess: 'Booking Successful!',
    
    // Tickets
    myTickets: 'My Tickets',
    ticketCode: 'Ticket Code',
    addToWallet: 'Add to Wallet',
    downloadTicket: 'Download Ticket',
    
    // Profile
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    help: 'Help',
    logout: 'Logout',
    
    // Schools
    schoolCommunication: 'School Communication',
    contactAdmin: 'Contact Administration',
    sendMessage: 'Send Message',
    
    // Scanner
    scanTicket: 'Scan Ticket',
    scanCode: 'Scan Code',
    validTicket: 'Valid Ticket',
    invalidTicket: 'Invalid Ticket',
    usedTicket: 'Ticket Already Used',
    
    // Language Switcher
    selectLanguage: 'Select Language',
    
    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    events: 'Événements',
    bookings: 'Mes Réservations',
    profile: 'Profil',
    
    // Home Screen
    welcome: 'Bienvenue sur Mi3AD',
    searchEvents: 'Rechercher des événements...',
    categories: 'Catégories',
    featuredEvents: 'Événements en Vedette',
    nearbyEvents: 'Découvrir Près de Vous',
    
    // Categories
    government: 'Gouvernement',
    schools: 'Écoles',
    clinics: 'Cliniques',
    occasions: 'Occasions',
    entertainment: 'Divertissement',
    openings: 'Ouvertures',
    
    // Event Details
    eventDetails: 'Détails de l\'Événement',
    date: 'Date',
    time: 'Heure',
    location: 'Lieu',
    price: 'Prix',
    free: 'Gratuit',
    bookNow: 'Réserver Maintenant',
    addToCalendar: 'Ajouter au Calendrier',
    shareEvent: 'Partager l\'Événement',
    
    // Booking
    booking: 'Réservation',
    tickets: 'Billets',
    ticketCount: 'Nombre de Billets',
    totalPrice: 'Prix Total',
    paymentMethod: 'Méthode de Paiement',
    creditCard: 'Carte de Crédit',
    confirmBooking: 'Confirmer la Réservation',
    bookingSuccess: 'Réservation Réussie!',
    
    // Tickets
    myTickets: 'Mes Billets',
    ticketCode: 'Code du Billet',
    addToWallet: 'Ajouter au Portefeuille',
    downloadTicket: 'Télécharger le Billet',
    
    // Profile
    settings: 'Paramètres',
    language: 'Langue',
    notifications: 'Notifications',
    help: 'Aide',
    logout: 'Déconnexion',
    
    // Schools
    schoolCommunication: 'Communication Scolaire',
    contactAdmin: 'Contacter l\'Administration',
    sendMessage: 'Envoyer un Message',
    
    // Scanner
    scanTicket: 'Scanner le Billet',
    scanCode: 'Scanner le Code',
    validTicket: 'Billet Valide',
    invalidTicket: 'Billet Invalide',
    usedTicket: 'Billet Déjà Utilisé',
    
    // Language Switcher
    selectLanguage: 'Sélectionner la Langue',
    
    // Common
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Sauvegarder',
    edit: 'Modifier',
    delete: 'Supprimer',
    loading: 'Chargement...',
    error: 'Une erreur s\'est produite',
    retry: 'Réessayer',
  },
  ru: {
    // Navigation
    home: 'Главная',
    events: 'События',
    bookings: 'Мои Бронирования',
    profile: 'Профиль',
    
    // Home Screen
    welcome: 'Добро пожаловать в Mi3AD',
    searchEvents: 'Поиск событий...',
    categories: 'Категории',
    featuredEvents: 'Рекомендуемые События',
    nearbyEvents: 'Рядом с Вами',
    
    // Categories
    government: 'Правительство',
    schools: 'Школы',
    clinics: 'Клиники',
    occasions: 'Мероприятия',
    entertainment: 'Развлечения',
    openings: 'Открытия',
    
    // Event Details
    eventDetails: 'Детали События',
    date: 'Дата',
    time: 'Время',
    location: 'Место',
    price: 'Цена',
    free: 'Бесплатно',
    bookNow: 'Забронировать',
    addToCalendar: 'Добавить в Календарь',
    shareEvent: 'Поделиться Событием',
    
    // Booking
    booking: 'Бронирование',
    tickets: 'Билеты',
    ticketCount: 'Количество Билетов',
    totalPrice: 'Общая Стоимость',
    paymentMethod: 'Способ Оплаты',
    creditCard: 'Кредитная Карта',
    confirmBooking: 'Подтвердить Бронирование',
    bookingSuccess: 'Бронирование Успешно!',
    
    // Tickets
    myTickets: 'Мои Билеты',
    ticketCode: 'Код Билета',
    addToWallet: 'Добавить в Кошелек',
    downloadTicket: 'Скачать Билет',
    
    // Profile
    settings: 'Настройки',
    language: 'Язык',
    notifications: 'Уведомления',
    help: 'Помощь',
    logout: 'Выйти',
    
    // Schools
    schoolCommunication: 'Связь со Школой',
    contactAdmin: 'Связаться с Администрацией',
    sendMessage: 'Отправить Сообщение',
    
    // Scanner
    scanTicket: 'Сканировать Билет',
    scanCode: 'Сканировать Код',
    validTicket: 'Действительный Билет',
    invalidTicket: 'Недействительный Билет',
    usedTicket: 'Билет Уже Использован',
    
    // Language Switcher
    selectLanguage: 'Выбрать Язык',
    
    // Common
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    edit: 'Редактировать',
    delete: 'Удалить',
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    retry: 'Повторить',
  },
};

const supportedLanguages = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇱🇾' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('ar'); // Default to Arabic
  const [i18n] = useState(() => {
    const i18nInstance = new I18n(translations);
    i18nInstance.defaultLocale = 'ar';
    i18nInstance.enableFallback = true;
    return i18nInstance;
  });

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    i18n.locale = locale;
    const isRTL = locale === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [locale, i18n]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLocale(savedLanguage);
      }
      // If no saved language, keep Arabic as default
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem('language', language);
      setLocale(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const getSupportedLanguages = () => supportedLanguages;

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  const value: I18nContextType = {
    i18n,
    locale,
    isRTL: locale === 'ar',
    t,
    changeLanguage,
    getSupportedLanguages,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}