import { useState, useEffect, useCallback } from 'react';
import { FoodPost } from 'shared/types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

const NEARBY_RADIUS_KM = 20;

export const usePosts = (locationFilter?: { lat?: number; lng?: number }) => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshSession } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lat = locationFilter?.lat;
      const lng = locationFilter?.lng;
      const fetched = await apiService.getPosts(
        lat !== undefined && lng !== undefined
          ? { lat, lng, radius: NEARBY_RADIUS_KM }
          : undefined
      );
      setPosts(fetched);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter?.lat, locationFilter?.lng]);

  const createPost = async (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    useAi: boolean;
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
      if (postData.useAi) {
        alert(`Posted: Portions: ${newPost.portions}, Meal Time: ${postData.mealTime}, Venue: ${postData.venueType}, Seating: ${postData.seatingCapacity}\nAI Surplus Prediction: ${newPost.predictedSurplusKg} kg`);
      } else {
        alert(`Posted: Portions: ${newPost.portions}, Meal Time: ${postData.mealTime}, Venue: ${postData.venueType}, Seating: ${postData.seatingCapacity}`);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to create post');
      alert(`Error creating post: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string, reason: string) => {
    if (!user) {
      setError('User session not found');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const deletedPost = await apiService.deletePost(postId, reason);
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, status: 'deleted' as const, deleteReason: reason } : post))
      );
      refreshSession();
      alert(`Deleted: Post deleted successfully.`);
    } catch (e: any) {
      setError(e.message || 'Failed to delete post');
      alert(`Error deleting post: ${e.message}`);
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
    deletePost,
    claimPost,
    claimBulkOrder,
    completePost,
  };
};
export default usePosts;
