import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Event } from '@/context/EventContext';
import { useI18n } from '@/context/I18nContext';
import { router } from 'expo-router';
import { Calendar, MapPin, Users, Building2, GraduationCap, Heart, PartyPopper, Clapperboard, Ribbon } from 'lucide-react-native';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  style?: any;
}

const categoryIcons = {
  government: Building2,
  schools: GraduationCap,
  clinics: Heart,
  occasions: PartyPopper,
  entertainment: Clapperboard,
  openings: Ribbon,
};

export default function EventCard({ event, onPress, style }: EventCardProps) {
  const { locale, t } = useI18n();

  const title = locale === 'ar' ? event.titleAr : event.title;
  const location = locale === 'ar' ? event.locationAr : event.location;
  const organizer = locale === 'ar' ? event.organizerAr : event.organizer;

  const CategoryIcon = categoryIcons[event.category];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${event.id}`);
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <Image source={{ uri: event.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <CategoryIcon size={14} color="#A855F7" />
            <Text style={styles.category}>{event.category}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {event.price === 0 ? t('free') : `${event.price} د.ل`}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        <View style={styles.details}>
          <View style={styles.detail}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(event.date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-US')}
            </Text>
          </View>
          
          <View style={styles.detail}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>{location}</Text>
          </View>
          
          <View style={styles.detail}>
            <Users size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {event.currentAttendees}/{event.maxAttendees}
            </Text>
          </View>
        </View>

        <Text style={styles.organizer} numberOfLines={1}>{organizer}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  header: {
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
  category: {
    fontSize: 12,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  priceContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  price: {
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
    color: '#D97706',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  details: {
    gap: 6,
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
    flex: 1,
  },
  organizer: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});