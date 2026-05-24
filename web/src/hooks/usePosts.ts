import { useState, useEffect, useCallback } from 'react';
import { FoodPost } from 'shared/types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

export const usePosts = () => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await apiService.getPosts();
      setPosts(fetched);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
  }) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newPost = await apiService.createPost({
        ...postData,
        currentUser: user,
      });
      setPosts((prev) => [newPost, ...prev]);
      refreshSession();
      alert(`Posted: Portions: ${newPost.portions}, Meal Time: ${postData.mealTime}, Venue: ${postData.venueType}, Seating: ${postData.seatingCapacity}\nAI Waste Prediction: ${newPost.predictedWasteKg} kg`);
    } catch (e: any) {
      setError(e.message || 'Failed to create post');
      alert(`Error creating post: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const claimPost = async (postId: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.claimPost(postId, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      alert(`Claimed: Successfully claimed the post from ${updatedPost.restaurantName}!`);
    } catch (e: any) {
      setError(e.message || 'Failed to claim post');
      alert(`Error claiming post: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const claimBulkOrder = async (postId: string, portions: number) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.claimBulkOrder(postId, portions, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      alert(`Claimed: Successfully claimed ${portions} portions from ${updatedPost.restaurantName}!`);
    } catch (e: any) {
      setError(e.message || 'Failed to claim bulk order');
      alert(`Error claiming bulk order: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const completePost = async (postId: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await apiService.completePost(postId, user);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );
      refreshSession();
      alert(`Completed: Order from ${updatedPost.restaurantName} marked as completed/distributed!`);
    } catch (e: any) {
      setError(e.message || 'Failed to complete order');
      alert(`Error completing order: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    claimPost,
    claimBulkOrder,
    completePost,
  };
};
export default usePosts;
