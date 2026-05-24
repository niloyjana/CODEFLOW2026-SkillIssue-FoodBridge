import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { formatDate, formatWaste } from '../utils/format';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

export default function RestaurantScreen() {
  const { user } = useAuth();
  const { posts, createPost, loading, fetchPosts } = usePosts();
  const [portions, setPortions] = useState('10');
  const [mealTime, setMealTime] = useState<'breakfast'|'lunch'|'dinner'>('lunch');
  const [venueType, setVenueType] = useState<'cafe'|'restaurant'|'fastfood'>('restaurant');
  const [seatingCapacity, setSeatingCapacity] = useState('30');

  const myPosts = posts.filter(p => p.restaurantId === user?.id);
  const activeCount = myPosts.filter(p => p.status === 'active').length;
  const claimedCount = myPosts.filter(p => p.status === 'claimed').length;
  const totalWasteSaved = myPosts.reduce((acc, p) => acc + p.predictedWasteKg, 0);

  const handleSubmit = () => {
    const p = parseInt(portions) || 0;
    const sc = parseInt(seatingCapacity) || 0;
    if (p <= 0 || sc <= 0) return;
    createPost({ portions: p, mealTime, venueType, seatingCapacity: sc });
  };

  const meals: ('breakfast'|'lunch'|'dinner')[] = ['breakfast', 'lunch', 'dinner'];
  const venues: ('cafe'|'restaurant'|'fastfood')[] = ['cafe', 'restaurant', 'fastfood'];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor={Colors.primary} />}>
      {/* Header Stats */}
      <View style={s.header}>
        <Text style={s.welcome}>Welcome, {user?.name || 'Restaurant'}! 🍽️</Text>
        <Text style={s.headerSub}>Track your surplus food metrics and impact.</Text>
        <View style={s.statsRow}>
          {[{ v: activeCount, l: 'Active', c: Colors.primary }, { v: claimedCount, l: 'Claimed', c: Colors.secondary }, { v: `${totalWasteSaved.toFixed(1)} kg`, l: 'Saved', c: Colors.primary }].map((st, i) => (
            <View key={i} style={s.statBox}><Text style={[s.statVal, { color: st.c }]}>{st.v}</Text><Text style={s.statLbl}>{st.l}</Text></View>
          ))}
        </View>
      </View>

      {/* Post Form */}
      <View style={s.formCard}>
        <Text style={s.formTitle}>🤖 Predict & Post Surplus</Text>
        <Text style={s.label}>Portions Available</Text>
        <TextInput style={s.input} value={portions} onChangeText={setPortions} keyboardType="numeric" />
        <Text style={s.label}>Meal Time</Text>
        <View style={s.chipRow}>
          {meals.map(m => (<TouchableOpacity key={m} style={[s.chip, mealTime === m && s.chipActive]} onPress={() => setMealTime(m)}><Text style={[s.chipText, mealTime === m && s.chipTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text></TouchableOpacity>))}
        </View>
        <Text style={s.label}>Venue Type</Text>
        <View style={s.chipRow}>
          {venues.map(v => (<TouchableOpacity key={v} style={[s.chip, venueType === v && s.chipActive]} onPress={() => setVenueType(v)}><Text style={[s.chipText, venueType === v && s.chipTextActive]}>{v === 'fastfood' ? 'Fast Food' : v.charAt(0).toUpperCase() + v.slice(1)}</Text></TouchableOpacity>))}
        </View>
        <Text style={s.label}>Seating Capacity</Text>
        <TextInput style={s.input} value={seatingCapacity} onChangeText={setSeatingCapacity} keyboardType="numeric" />
        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>📤 Post with AI Prediction</Text>}
        </TouchableOpacity>
      </View>

      {/* My Posts */}
      <Text style={s.sectionTitle}>Your Food Posts</Text>
      {myPosts.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyText}>No posts yet. Submit one above!</Text></View>
      ) : myPosts.map(post => (
        <View key={post.id} style={s.postCard}>
          <View style={s.postHeader}>
            <Text style={s.postPortions}>{post.portions} portions</Text>
            <View style={[s.badge, post.status === 'active' ? s.badgeActive : post.status === 'claimed' ? s.badgeClaimed : s.badgeCompleted]}>
              <Text style={s.badgeText}>{post.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>📅 Posted</Text><Text style={s.metaVal}>{formatDate(post.createdAt)}</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>⏰ Pickup By</Text><Text style={[s.metaVal, { color: Colors.secondary }]}>{formatDate(post.pickupBy)}</Text>
          </View>
          <View style={s.wasteRow}>
            <Text style={s.wasteLabel}>🌿 AI Waste Prediction:</Text>
            <Text style={s.wasteVal}>{formatWaste(post.predictedWasteKg)}</Text>
          </View>
          {post.status === 'claimed' && <Text style={s.claimedText}>✅ Claimed by a volunteer</Text>}
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
  formCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.md, borderWidth: 1, borderColor: Colors.border },
  formTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.sm, padding: 12, fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.lg },
  chipRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: 'rgba(0,0,0,0.02)' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextActive: { color: '#FFF', fontWeight: FontWeight.bold },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', ...Shadow.md },
  submitText: { color: '#FFF', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  postCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  postPortions: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeActive: { backgroundColor: Colors.primaryGlow },
  badgeClaimed: { backgroundColor: 'rgba(255,193,7,0.15)' },
  badgeCompleted: { backgroundColor: 'rgba(76,175,80,0.15)' },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metaLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaVal: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  wasteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primaryGlow, borderRadius: Radius.sm, padding: Spacing.md, marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  wasteLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  wasteVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  claimedText: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: FontWeight.semibold, marginTop: Spacing.sm },
});
