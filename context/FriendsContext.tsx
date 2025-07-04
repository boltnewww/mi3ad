import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  isLoading: boolean;
  sendFriendRequest: (userId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchFriends: (query: string) => Friend[];
  getPendingRequestsCount: () => number;
  getSentRequestsCount: () => number;
  getFriendsCount: () => number;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  getBlockedUsers: () => string[];
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

// Mock data for friends
const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    email: 'ahmed@example.com',
    phone: '+218-91-123-4567',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 5,
  },
  {
    id: '2',
    name: 'فاطمة علي',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    email: 'fatima@example.com',
    phone: '+218-92-234-5678',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mutualFriends: 3,
  },
  {
    id: '3',
    name: 'محمد الصادق',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    email: 'mohamed@example.com',
    phone: '+218-93-345-6789',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 8,
  },
  {
    id: '4',
    name: 'عائشة حسن',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    email: 'aisha@example.com',
    phone: '+218-94-456-7890',
    isOnline: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    mutualFriends: 2,
  },
];

// Mock data for friend requests
const mockFriendRequests: FriendRequest[] = [
  {
    id: '1',
    fromUserId: '5',
    fromUserName: 'سارة أحمد',
    fromUserAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    toUserId: 'current-user',
    message: 'مرحباً! أود إضافتك كصديق',
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    fromUserId: '6',
    fromUserName: 'خالد محمود',
    fromUserAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    toUserId: 'current-user',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      const [storedFriends, storedRequests, storedBlocked] = await Promise.all([
        AsyncStorage.getItem('friends'),
        AsyncStorage.getItem('friendRequests'),
        AsyncStorage.getItem('blockedUsers'),
      ]);

      if (storedFriends) {
        setFriends([...mockFriends, ...JSON.parse(storedFriends)]);
      }
      if (storedRequests) {
        setFriendRequests([...mockFriendRequests, ...JSON.parse(storedRequests)]);
      }
      if (storedBlocked) {
        setBlockedUsers(JSON.parse(storedBlocked));
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
    }
  };

  const saveFriendsData = async (updatedFriends: Friend[]) => {
    try {
      const userFriends = updatedFriends.filter(f => 
        !mockFriends.some(mock => mock.id === f.id)
      );
      await AsyncStorage.setItem('friends', JSON.stringify(userFriends));
    } catch (error) {
      console.error('Error saving friends data:', error);
    }
  };

  const saveFriendRequests = async (updatedRequests: FriendRequest[]) => {
    try {
      const userRequests = updatedRequests.filter(r => 
        !mockFriendRequests.some(mock => mock.id === r.id)
      );
      await AsyncStorage.setItem('friendRequests', JSON.stringify(userRequests));
    } catch (error) {
      console.error('Error saving friend requests:', error);
    }
  };

  const sendFriendRequest = async (userId: string, message?: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const newRequest: FriendRequest = {
        id: Date.now().toString(),
        fromUserId: 'current-user',
        fromUserName: 'أنت',
        toUserId: userId,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [...friendRequests, newRequest];
      setFriendRequests(updatedRequests);
      await saveFriendRequests(updatedRequests);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const request = friendRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Friend request not found');

      // Add to friends list
      const newFriend: Friend = {
        id: request.fromUserId,
        name: request.fromUserName,
        avatar: request.fromUserAvatar,
        email: `${request.fromUserName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: '+218-90-000-0000',
        isOnline: Math.random() > 0.5,
        lastSeen: new Date().toISOString(),
        mutualFriends: Math.floor(Math.random() * 10),
      };

      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);
      await saveFriendsData(updatedFriends);

      // Remove from requests
      const updatedRequests = friendRequests.filter(r => r.id !== requestId);
      setFriendRequests(updatedRequests);
      await saveFriendRequests(updatedRequests);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const updatedRequests = friendRequests.filter(r => r.id !== requestId);
      setFriendRequests(updatedRequests);
      await saveFriendRequests(updatedRequests);
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async (friendId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const updatedFriends = friends.filter(f => f.id !== friendId);
      setFriends(updatedFriends);
      await saveFriendsData(updatedFriends);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchFriends = (query: string): Friend[] => {
    const lowercaseQuery = query.toLowerCase();
    return friends.filter(friend =>
      friend.name.toLowerCase().includes(lowercaseQuery) ||
      friend.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getPendingRequestsCount = (): number => {
    return friendRequests.filter(r => r.status === 'pending' && r.toUserId === 'current-user').length;
  };

  const getSentRequestsCount = (): number => {
    return friendRequests.filter(r => r.status === 'pending' && r.fromUserId === 'current-user').length;
  };

  const getFriendsCount = (): number => {
    return friends.length;
  };

  const blockUser = async (userId: string): Promise<void> => {
    try {
      const updatedBlocked = [...blockedUsers, userId];
      setBlockedUsers(updatedBlocked);
      await AsyncStorage.setItem('blockedUsers', JSON.stringify(updatedBlocked));
      
      // Remove from friends if they are a friend
      const updatedFriends = friends.filter(f => f.id !== userId);
      setFriends(updatedFriends);
      await saveFriendsData(updatedFriends);
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (userId: string): Promise<void> => {
    try {
      const updatedBlocked = blockedUsers.filter(id => id !== userId);
      setBlockedUsers(updatedBlocked);
      await AsyncStorage.setItem('blockedUsers', JSON.stringify(updatedBlocked));
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const getBlockedUsers = (): string[] => {
    return blockedUsers;
  };

  const value: FriendsContextType = {
    friends,
    friendRequests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchFriends,
    getPendingRequestsCount,
    getSentRequestsCount,
    getFriendsCount,
    blockUser,
    unblockUser,
    getBlockedUsers,
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}