import { Habit, HabitLog, UserStats } from '../types';

const API_URL = 'http://localhost:3001/api';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// User Data Interface
export interface UserDocument {
  _id?: string;
  userId: string;
  habits: Habit[];
  logs: HabitLog;
  stats: UserStats;
  updatedAt: Date;
}

// Get user data
export async function getUserData(): Promise<UserDocument | null> {
  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Initialize user data if not exists
export async function initializeUserData(): Promise<UserDocument> {
  const data = await getUserData();
  if (data) {
    return data;
  }
  
  // If no data, the backend will create it
  const newUser = {
    userId: 'current_user',
    habits: [],
    logs: {},
    stats: { streakFreezes: 0, totalXp: 0 },
    updatedAt: new Date(),
  };
  
  return newUser as UserDocument;
}

// Update all user data at once
export async function updateAllUserData(
  habits: Habit[],
  logs: HabitLog,
  stats: UserStats
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ habits, logs, stats }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user data');
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}
