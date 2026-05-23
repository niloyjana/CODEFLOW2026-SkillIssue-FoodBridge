import { useState, useEffect, useCallback } from 'react';
import { LeaderboardEntry } from 'shared/types';
import { apiService } from '../services/api';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLeaderboard();
      setEntries(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const restaurantLeaderboard = entries
    .filter((entry) => entry.userType === 'restaurant')
    .sort((a, b) => b.points - a.points);

  const shelterLeaderboard = entries
    .filter((entry) => entry.userType === 'individual')
    .sort((a, b) => b.points - a.points);

  return {
    restaurantLeaderboard,
    shelterLeaderboard,
    loading,
    error,
    refresh: fetchLeaderboard,
  };
};
