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
  Linking,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
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

  // AI Prediction state
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (p <= 0 || sc <= 0) {
      Alert.alert('Invalid', 'Please enter valid portions and seating capacity.');
      return;
    }
    createPost({ portions: p, mealTime, venueType, seatingCapacity: sc });
    setAiRecommendation(null);
  };

  const handlePredict = async () => {
    const p = parseInt(portions) || 0;
    const sc = parseInt(seatingCapacity) || 0;
    if (p <= 0 || sc <= 0) {
      Alert.alert('Invalid', 'Please enter valid portions and seating capacity.');
      return;
    }
    setPredicting(true);
    setAiRecommendation(null);
    try {
      // Mock AI prediction
      await new Promise((r) => setTimeout(r, 1200));
      const surplusPortions = Math.max(1, Math.round(p * 0.6));
      const surplusKg = surplusPortions * 0.35;
      const feedMin = Math.max(1, Math.floor(surplusPortions * 0.5));
      const feedMax = Math.max(2, Math.ceil(surplusPortions * 0.6));
      setAiRecommendation(
        `Based on your sales history, you'll have ${surplusPortions} surplus portions tonight. That's ${surplusKg.toFixed(1)}kg of food that can feed ${feedMin}-${feedMax} people. Post it on FoodBridge.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const handlePickCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (!result.canceled && result.assets?.[0]) {
        setCsvFile(result.assets[0].name);
        setUploading(true);
        // Mock upload + training
        await new Promise((r) => setTimeout(r, 2000));
        setUploading(false);
        Alert.alert('Training Complete', 'AI model trained successfully on your sales data!');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick file');
    }
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

          {/* AI Recommendation Card */}
          {aiRecommendation && (
            <View style={s.aiCard}>
              <Text style={s.aiCardTitle}>🌿 AI Surplus Suggestion</Text>
              <Text style={s.aiCardText}>{aiRecommendation}</Text>
            </View>
          )}

          {/* Two Buttons: Post + Predict */}
          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitText}>＋ Post Surplus Food</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.predictBtn, (predicting || loading) && { opacity: 0.6 }]}
            onPress={handlePredict}
            disabled={predicting || loading}
            activeOpacity={0.8}
          >
            {predicting ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={s.predictBtnText}>🌿 Predict with AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── AI Sales Training Data (matches web SalesUpload) ── */}
        <View style={s.salesCard}>
          <View style={s.salesHeader}>
            <View style={s.salesIconBox}>
              <Text style={{ fontSize: 18 }}>🗄️</Text>
            </View>
            <Text style={s.salesTitle}>AI Sales Training Data</Text>
          </View>

          <View style={s.salesCallout}>
            <Text style={s.salesCalloutText}>
              To improve AI surplus predictions, upload your historical POS sales data. Make sure it contains these columns:
            </Text>
          </View>

          <View style={s.codeBlock}>
            <View style={s.codeLabel}>
              <Text style={s.codeLabelText}>EXAMPLE.CSV</Text>
            </View>
            <Text style={s.codeText}>
              <Text style={{ color: '#ff9e64' }}>date</Text>,
              <Text style={{ color: '#ff9e64' }}>day_of_week</Text>,
              <Text style={{ color: '#ff9e64' }}>meal_period</Text>,
              <Text style={{ color: '#ff9e64' }}>portions_sold</Text>,
              <Text style={{ color: '#ff9e64' }}>prepared_quantity</Text>
              {`\n`}
              <Text style={{ color: '#9ece6a' }}>2026-05-17</Text>,
              <Text style={{ color: '#bb9af7' }}>saturday</Text>,
              <Text style={{ color: '#bb9af7' }}>dinner</Text>,
              <Text style={{ color: '#7dcfff' }}>92</Text>,
              <Text style={{ color: '#7dcfff' }}>110</Text>
              {`\n`}
              <Text style={{ color: '#9ece6a' }}>2026-05-18</Text>,
              <Text style={{ color: '#bb9af7' }}>sunday</Text>,
              <Text style={{ color: '#bb9af7' }}>dinner</Text>,
              <Text style={{ color: '#7dcfff' }}>85</Text>,
              <Text style={{ color: '#7dcfff' }}>100</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={s.uploadZone}
            onPress={handlePickCSV}
            disabled={uploading}
            activeOpacity={0.7}
          >
            {uploading ? (
              <>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={s.uploadZoneTitle}>Training AI Model...</Text>
              </>
            ) : (
              <>
                <View style={s.uploadIconCircle}>
                  <Text style={{ fontSize: 24 }}>📤</Text>
                </View>
                <Text style={s.uploadZoneTitle}>{csvFile || 'Tap to select CSV'}</Text>
                <Text style={s.uploadZoneSub}>{csvFile ? `Selected` : 'Select from your files'}</Text>
              </>
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
  predictBtn: {
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    marginTop: Spacing.sm,
  },
  predictBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  aiCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    marginBottom: Spacing.lg,
  },
  aiCardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 4 },
  aiCardText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  // ── Sales Training Data ──
  salesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  salesIconBox: {
    padding: 8,
    backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.sm,
  },
  salesTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  salesCallout: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    padding: Spacing.md,
    borderTopRightRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  salesCalloutText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#1a1b26',
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  codeLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  codeLabelText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 18,
    color: '#a9b1d6',
  },
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  uploadZoneTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  uploadZoneSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // ── Map ──
  mapCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapPlaceholder: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mapPlaceholderTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mapPlaceholderSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  mapOpenBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...Shadow.sm,
  },
  mapOpenBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

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
