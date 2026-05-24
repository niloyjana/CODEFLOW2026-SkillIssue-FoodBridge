import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { formatDate, formatSurplus, formatPortions } from '../utils/format';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

const DELETE_REASONS = [
  'Food no longer available',
  'Incorrect details entered',
  'Restaurant closed early',
  'Other',
];

export default function RestaurantScreen() {
  const { user } = useAuth();
  const { posts, createPost, loading, fetchPosts } = usePosts();
  const [portions, setPortions] = useState('10');
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [venueType, setVenueType] = useState<'cafe' | 'restaurant' | 'fastfood'>('restaurant');
  const [seatingCapacity, setSeatingCapacity] = useState('30');

  // Delete modal state
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('Food no longer available');
  const [customReason, setCustomReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const myPosts = posts.filter((p) => p.restaurantId === user?.id && p.status !== 'deleted');
  const activeCount = myPosts.filter((p) => p.status === 'active').length;
  const claimedCount = myPosts.filter((p) => p.status === 'claimed').length;
  const totalSurplusSaved = myPosts.reduce((acc, p) => acc + (p.predictedSurplusKg || 0), 0);

  const handleSubmit = () => {
    const p = parseInt(portions) || 0;
    const sc = parseInt(seatingCapacity) || 0;
    if (p <= 0 || sc <= 0) return;
    createPost({ portions: p, mealTime, venueType, seatingCapacity: sc });
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    const finalReason = deleteReason === 'Other' ? customReason.trim() : deleteReason;
    if (!finalReason) return;
    setDeleting(true);
    try {
      // Mock delete — remove from local state
      Alert.alert('Deleted', 'Post has been removed.');
      setDeletePostId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const meals: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
  const venues: ('cafe' | 'restaurant' | 'fastfood')[] = ['cafe', 'restaurant', 'fastfood'];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor={Colors.primary} />
        }
      >
        {/* ── Header Banner (matches web) ────────────────────────── */}
        <View style={s.header}>
          <Text style={s.welcome}>Welcome back, {user?.name || 'Restaurant Partner'}!</Text>
          <Text style={s.headerSub}>
            Optimize your surplus food metrics and track environmental impact in real-time.
          </Text>
          <View style={s.statsRow}>
            {[
              { v: activeCount, l: 'Active Posts', c: Colors.primary },
              { v: claimedCount, l: 'Claimed Pickups', c: Colors.secondary },
              { v: `${totalSurplusSaved.toFixed(1)} kg`, l: 'Surplus Saved', c: Colors.primary },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={[s.statVal, { color: st.c }]}>{st.v}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Post Form (matches web PostForm) ────────────────────── */}
        <View style={s.formCard}>
          <View style={s.formHeader}>
            <Text style={s.formIcon}>🤖</Text>
            <Text style={s.formTitle}>Predict & Post Surplus</Text>
          </View>

          <Text style={s.label}>Portions Available</Text>
          <TextInput
            style={s.input}
            value={portions}
            onChangeText={setPortions}
            keyboardType="numeric"
            placeholder="e.g. 10"
            placeholderTextColor={Colors.textLight}
          />

          <Text style={s.label}>Meal Time</Text>
          <View style={s.chipRow}>
            {meals.map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.chip, mealTime === m && s.chipActive]}
                onPress={() => setMealTime(m)}
              >
                <Text style={[s.chipText, mealTime === m && s.chipTextActive]}>
                  {m === 'breakfast' ? '🌅 Breakfast' : m === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Venue Type</Text>
          <View style={s.chipRow}>
            {venues.map((v) => (
              <TouchableOpacity
                key={v}
                style={[s.chip, venueType === v && s.chipActive]}
                onPress={() => setVenueType(v)}
              >
                <Text style={[s.chipText, venueType === v && s.chipTextActive]}>
                  {v === 'cafe' ? '☕ Café' : v === 'restaurant' ? '🍽️ Restaurant' : '🍔 Fast Food'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Seating Capacity</Text>
          <TextInput
            style={s.input}
            value={seatingCapacity}
            onChangeText={setSeatingCapacity}
            keyboardType="numeric"
            placeholder="e.g. 30"
            placeholderTextColor={Colors.textLight}
          />

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitText}>📤 Post with AI Prediction</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active Food Posts (matches web RestaurantDashboard) ── */}
        <Text style={s.sectionTitle}>Active Food Posts</Text>
        {myPosts.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>
              You have not posted any food donations yet. Use the form above to submit one!
            </Text>
          </View>
        ) : (
          myPosts.map((post) => (
            <View
              key={post.id}
              style={[
                s.postCard,
                post.status === 'claimed' && { borderLeftWidth: 3, borderLeftColor: Colors.secondary },
              ]}
            >
              {/* Post header — portions + status badge */}
              <View style={s.postHeader}>
                <Text style={s.postPortions}>🍽️ {formatPortions(post.portions)}</Text>
                <View
                  style={[
                    s.badge,
                    post.status === 'active'
                      ? s.badgeActive
                      : post.status === 'claimed'
                      ? s.badgeClaimed
                      : s.badgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      s.badgeText,
                      post.status === 'claimed' && { color: '#e65100' },
                      post.status === 'completed' && { color: Colors.primary },
                    ]}
                  >
                    {post.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Meta rows — Posted / Pickup */}
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>📅 Posted At</Text>
                <Text style={s.metaVal}>{formatDate(post.createdAt)}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>⏰ Pickup By</Text>
                <Text style={[s.metaVal, { color: Colors.secondary }]}>
                  {formatDate(post.pickupBy)}
                </Text>
              </View>

              {/* AI Surplus row */}
              <View style={s.wasteRow}>
                <Text style={s.wasteLabel}>🌿 AI Surplus Saved:</Text>
                <Text style={s.wasteVal}>{formatSurplus(post.predictedSurplusKg)}</Text>
              </View>

              {/* Claimed info */}
              {post.status === 'claimed' && (
                <Text style={s.claimedText}>
                  ✅ Claimed by a volunteer and scheduled for pickup.
                </Text>
              )}

              {/* Delete button — only for active posts */}
              {post.status === 'active' && (
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => {
                    setDeletePostId(post.id);
                    setDeleteReason('Food no longer available');
                    setCustomReason('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={s.deleteBtnText}>🗑️ Delete Post</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Delete Confirmation Modal (matches web portal) ──── */}
      <Modal visible={!!deletePostId} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Delete Food Donation</Text>
            <Text style={s.modalDesc}>
              Are you sure you want to delete this donation post? This action will reverse points
              and cannot be undone.
            </Text>

            <Text style={s.label}>Reason for deletion</Text>
            <View style={s.reasonList}>
              {DELETE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[s.reasonItem, deleteReason === reason && s.reasonItemActive]}
                  onPress={() => setDeleteReason(reason)}
                >
                  <View style={[s.radioOuter, deleteReason === reason && s.radioOuterActive]}>
                    {deleteReason === reason && <View style={s.radioInner} />}
                  </View>
                  <Text
                    style={[s.reasonText, deleteReason === reason && s.reasonTextActive]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {deleteReason === 'Other' && (
              <TextInput
                style={[s.input, { minHeight: 80, textAlignVertical: 'top', marginTop: 8 }]}
                placeholder="Type your deletion reason here..."
                placeholderTextColor={Colors.textLight}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
              />
            )}

            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setDeletePostId(null)}
                disabled={deleting}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.confirmDeleteBtn,
                  (deleting || (deleteReason === 'Other' && !customReason.trim())) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleDelete}
                disabled={deleting || (deleteReason === 'Other' && !customReason.trim())}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.confirmDeleteText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 40 },

  // ── Header Banner ──
  header: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.12)',
    ...Shadow.md,
  },
  welcome: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(46,125,50,0.1)',
  },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLbl: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // ── Post Form ──
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  formIcon: { fontSize: 22 },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    padding: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  chipTextActive: { color: '#FFF', fontWeight: FontWeight.bold },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.md,
  },
  submitText: { color: '#FFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },

  // ── Posts List ──
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center' },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  postPortions: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeActive: { backgroundColor: Colors.primaryGlow },
  badgeClaimed: { backgroundColor: 'rgba(255,193,7,0.15)' },
  badgeCompleted: { backgroundColor: 'rgba(76,175,80,0.15)' },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metaLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaVal: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  wasteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wasteLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  wasteVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  claimedText: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.sm,
  },
  deleteBtn: {
    marginTop: Spacing.md,
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.2)',
  },
  deleteBtnText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.semibold,
  },

  // ── Delete Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 420,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  reasonList: { gap: Spacing.sm, marginBottom: Spacing.md },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reasonItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  reasonTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  confirmDeleteBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.error,
    ...Shadow.sm,
  },
  confirmDeleteText: {
    fontSize: FontSize.sm,
    color: '#FFF',
    fontWeight: FontWeight.bold,
  },
});
