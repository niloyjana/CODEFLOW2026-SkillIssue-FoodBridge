import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { formatDate, formatWaste } from '../utils/format';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

export default function IndividualScreen() {
  const { user } = useAuth();
  const { posts, createPost, claimPost, loading, fetchPosts } = usePosts();
  const [portions, setPortions] = useState('10');
  const [mealTime, setMealTime] = useState<'breakfast'|'lunch'|'dinner'>('lunch');
  const [venueType, setVenueType] = useState<'cafe'|'restaurant'|'fastfood'>('restaurant');
  const [seatingCapacity, setSeatingCapacity] = useState('30');

  const myPosts = posts.filter(p => p.restaurantId === user?.id);
  const availablePosts = posts.filter(p => p.status === 'active' && p.restaurantId !== user?.id);
  const activeCount = myPosts.filter(p => p.status === 'active').length;
  const totalWaste = myPosts.reduce((a, p) => a + p.predictedWasteKg, 0);

  const meals: ('breakfast'|'lunch'|'dinner')[] = ['breakfast', 'lunch', 'dinner'];
  const venues: ('cafe'|'restaurant'|'fastfood')[] = ['cafe', 'restaurant', 'fastfood'];

  const handleSubmit = () => {
    const p = parseInt(portions) || 0;
    const sc = parseInt(seatingCapacity) || 0;
    if (p <= 0 || sc <= 0) return;
    createPost({ portions: p, mealTime, venueType, seatingCapacity: sc });
  };

  // Badges
  const badges: { label: string; earned: boolean; emoji: string }[] = [
    { label: 'Surplus Savior', earned: myPosts.length >= 15, emoji: '🏆' },
    { label: 'Community Hero', earned: myPosts.length >= 10, emoji: '🥇' },
    { label: 'Consistent Packer', earned: myPosts.length >= 5, emoji: '🥈' },
    { label: 'First Step', earned: myPosts.length > 0, emoji: '🌟' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor={Colors.primary} />}>
      {/* Stats Header */}
      <View style={s.header}>
        <Text style={s.welcome}>Welcome, {user?.name || 'Volunteer'}! ❤️</Text>
        <Text style={s.headerSub}>Post donations, earn badges, and track impact.</Text>
        <View style={s.statsRow}>
          {[{ v: activeCount, l: 'Posts', c: Colors.primary }, { v: `${user?.points || 0} pts`, l: 'Points', c: Colors.secondary }, { v: `${totalWaste.toFixed(1)} kg`, l: 'Saved', c: Colors.primary }].map((st, i) => (
            <View key={i} style={s.statBox}><Text style={[s.statVal, { color: st.c }]}>{st.v}</Text><Text style={s.statLbl}>{st.l}</Text></View>
          ))}
        </View>
      </View>

      {/* Profile & Badges */}
      <View style={s.profileCard}>
        <Text style={s.profileName}>👤 {user?.name}</Text>
        <Text style={s.profileEmail}>{user?.email}</Text>
        {user?.address && <Text style={s.profileMeta}>📍 {user.address}</Text>}
        <View style={s.badgesSection}>
          <Text style={s.badgesTitle}>Earned Badges</Text>
          <View style={s.badgesRow}>
            {badges.filter(b => b.earned).map((b, i) => (
              <View key={i} style={s.badgeChip}><Text style={s.badgeChipText}>{b.emoji} {b.label}</Text></View>
            ))}
            {badges.filter(b => b.earned).length === 0 && <Text style={s.noBadges}>Post a donation to earn badges!</Text>}
          </View>
        </View>
      </View>

      {/* Post Form */}
      <View style={s.formCard}>
        <Text style={s.formTitle}>🤖 Post Surplus Food</Text>
        <Text style={s.label}>Portions</Text>
        <TextInput style={s.input} value={portions} onChangeText={setPortions} keyboardType="numeric" />
        <Text style={s.label}>Meal Time</Text>
        <View style={s.chipRow}>{meals.map(m => (<TouchableOpacity key={m} style={[s.chip, mealTime === m && s.chipActive]} onPress={() => setMealTime(m)}><Text style={[s.chipText, mealTime === m && s.chipTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text></TouchableOpacity>))}</View>
        <Text style={s.label}>Venue</Text>
        <View style={s.chipRow}>{venues.map(v => (<TouchableOpacity key={v} style={[s.chip, venueType === v && s.chipActive]} onPress={() => setVenueType(v)}><Text style={[s.chipText, venueType === v && s.chipTextActive]}>{v === 'fastfood' ? 'Fast Food' : v.charAt(0).toUpperCase() + v.slice(1)}</Text></TouchableOpacity>))}</View>
        <Text style={s.label}>Seating</Text>
        <TextInput style={s.input} value={seatingCapacity} onChangeText={setSeatingCapacity} keyboardType="numeric" />
        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>📤 Post with AI</Text>}
        </TouchableOpacity>
      </View>

      {/* Available Posts to Claim */}
      <Text style={s.sectionTitle}>🍲 Available Food Nearby</Text>
      {availablePosts.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyText}>No posts nearby right now.</Text></View>
      ) : availablePosts.map(post => (
        <View key={post.id} style={s.postCard}>
          <View style={s.postHeader}>
            <Text style={s.postName}>🍽️ {post.restaurantName}</Text>
            <View style={s.activeBadge}><Text style={s.activeBadgeText}>ACTIVE</Text></View>
          </View>
          <Text style={s.postMeta}>{post.portions} portions · {post.address || 'No address'}</Text>
          <Text style={s.postMeta}>⏰ Pickup by {formatDate(post.pickupBy)}</Text>
          <TouchableOpacity style={[s.claimBtn, loading && { opacity: 0.6 }]} onPress={() => claimPost(post.id)} disabled={loading}>
            <Text style={s.claimBtnText}>Claim 1 Portion (+10 pts)</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* My Posts */}
      <Text style={[s.sectionTitle, { marginTop: Spacing.xl }]}>📋 Your Posts</Text>
      {myPosts.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyText}>No posts yet.</Text></View>
      ) : myPosts.map(post => (
        <View key={post.id} style={s.postCard}>
          <View style={s.postHeader}><Text style={s.postPortions}>{post.portions} portions</Text>
            <View style={[s.statusBadge, post.status === 'active' ? s.badgeActiveColor : s.badgeClaimedColor]}><Text style={s.badgeSmText}>{post.status.toUpperCase()}</Text></View>
          </View>
          <View style={s.wasteRow}><Text style={s.wasteLabel}>🌿 AI Waste:</Text><Text style={s.wasteVal}>{formatWaste(post.predictedWasteKg)}</Text></View>
          {post.status === 'claimed' && <Text style={s.claimedNote}>✅ Claimed by {post.claimedByName || 'a shelter'}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  header: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border, ...Shadow.md },
  welcome: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  profileCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 4 },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  profileMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  badgesSection: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.md, marginTop: Spacing.md },
  badgesTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.sm },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeChip: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  badgeChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  noBadges: { fontSize: FontSize.sm, color: Colors.textLight, fontStyle: 'italic' },
  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.md, borderWidth: 1, borderColor: Colors.border },
  formTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.sm, padding: 12, fontSize: FontSize.md, marginBottom: Spacing.lg },
  chipRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: '#FFF', fontWeight: FontWeight.bold },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', ...Shadow.md },
  submitText: { color: '#FFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  postCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  postName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, flex: 1 },
  postPortions: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  postMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  activeBadge: { backgroundColor: Colors.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  activeBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeActiveColor: { backgroundColor: Colors.primaryGlow },
  badgeClaimedColor: { backgroundColor: 'rgba(255,193,7,0.15)' },
  badgeSmText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  claimBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.md, ...Shadow.sm },
  claimBtnText: { color: '#FFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  wasteRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.primaryGlow, borderRadius: Radius.sm, padding: Spacing.md, marginTop: Spacing.sm },
  wasteLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  wasteVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  claimedNote: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.semibold, marginTop: Spacing.sm },
});
