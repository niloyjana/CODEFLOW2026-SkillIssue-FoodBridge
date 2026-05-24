import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatDate } from '../utils/format';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

export default function ShelterScreen() {
  const { user } = useAuth();
  const { posts, claimBulkOrder, completePost, loading, fetchPosts } = usePosts();
  const { shelterLeaderboard } = useLeaderboard();
  const [selectedPortions, setSelectedPortions] = useState<Record<string, number>>({});

  const availablePosts = posts.filter(p => p.status === 'active' && p.portions > 0);
  const myClaimedPosts = posts.filter(p => p.claimedBy === user?.id);
  const shelterRank = shelterLeaderboard.findIndex(e => e.id === user?.id) + 1 || 0;

  const handleClaim = async (postId: string, max: number) => {
    const qty = selectedPortions[postId] || max;
    await claimBulkOrder(postId, qty);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor={Colors.primary} />}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.welcome}>Welcome, {user?.name || 'Shelter'}! 🏠</Text>
        <Text style={s.headerSub}>Claim food donations and manage distribution.</Text>
        <View style={s.statsRow}>
          {[
            { v: user?.peopleServed || 0, l: 'Served', c: Colors.primary },
            { v: `${user?.points || 0} pts`, l: 'Points', c: Colors.secondary },
            { v: shelterRank > 0 ? `#${shelterRank}` : '-', l: 'Rank', c: Colors.primary },
          ].map((st, i) => (
            <View key={i} style={s.statBox}><Text style={[s.statVal, { color: st.c }]}>{st.v}</Text><Text style={s.statLbl}>{st.l}</Text></View>
          ))}
        </View>
      </View>

      {/* Available Posts */}
      <Text style={s.sectionTitle}>🍲 Available Bulk Food</Text>
      {availablePosts.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyText}>No active posts available right now.</Text></View>
      ) : availablePosts.map(post => {
        const qty = selectedPortions[post.id] || post.portions;
        const pts = qty * 5;
        return (
          <View key={post.id} style={s.postCard}>
            <View style={s.postHeader}>
              <Text style={s.postName}>🍽️ {post.restaurantName}</Text>
              <View style={s.badgeActive}><Text style={s.badgeText}>ACTIVE</Text></View>
            </View>
            <Text style={s.postPortions}>{post.portions} portions available</Text>
            {post.address && <Text style={s.metaItem}>📍 {post.address}</Text>}
            <View style={s.metaRow}>
              <Text style={s.metaItem}>⏰ Pickup by {formatDate(post.pickupBy)}</Text>
              <Text style={[s.metaItem, { color: Colors.primary, fontWeight: FontWeight.bold }]}>🌿 {post.predictedWasteKg} kg saved</Text>
            </View>
            <View style={s.claimRow}>
              <View style={s.portionInput}>
                <Text style={s.portionLabel}>Portions</Text>
                <TextInput
                  style={s.portionField}
                  value={String(qty)}
                  onChangeText={t => {
                    const n = Math.min(post.portions, Math.max(1, parseInt(t) || 1));
                    setSelectedPortions(p => ({ ...p, [post.id]: n }));
                  }}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={[s.claimBtn, loading && { opacity: 0.6 }]} onPress={() => handleClaim(post.id, post.portions)} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.claimBtnText}>Claim (+{pts} pts)</Text>}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* My Claims */}
      <Text style={[s.sectionTitle, { marginTop: Spacing.xl }]}>📋 Your Claimed Orders</Text>
      {myClaimedPosts.length === 0 ? (
        <View style={s.emptyCard}><Text style={s.emptyText}>No claimed orders yet.</Text></View>
      ) : myClaimedPosts.map(post => (
        <View key={post.id} style={s.postCard}>
          <View style={s.postHeader}>
            <Text style={s.postName}>🍽️ {post.restaurantName}</Text>
            <View style={post.status === 'claimed' ? s.badgeClaimed : s.badgeCompleted}>
              <Text style={s.badgeText}>{post.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={s.postPortions}>{post.portions} portions</Text>
          {post.address && <Text style={s.metaItem}>📍 {post.address}</Text>}
          <Text style={s.metaItem}>⏰ {formatDate(post.pickupBy)}</Text>
          {post.status === 'claimed' ? (
            <TouchableOpacity style={s.completeBtn} onPress={() => completePost(post.id)} disabled={loading}>
              <Text style={s.completeBtnText}>✅ Mark as Distributed</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.completedText}>✅ Distributed successfully!</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  header: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: 'rgba(33,150,243,0.15)', ...Shadow.md },
  welcome: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary, marginBottom: 4 },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statBox: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  postCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  postName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, flex: 1 },
  postPortions: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
  metaItem: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  metaRow: { marginTop: Spacing.sm },
  badgeActive: { backgroundColor: Colors.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeClaimed: { backgroundColor: 'rgba(255,193,7,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeCompleted: { backgroundColor: 'rgba(76,175,80,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  claimRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, marginTop: Spacing.lg },
  portionInput: { width: 100 },
  portionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold, marginBottom: 4 },
  portionField: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.sm, padding: 8, fontSize: FontSize.md, textAlign: 'center' },
  claimBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center', ...Shadow.sm },
  claimBtnText: { color: '#FFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  completeBtn: { backgroundColor: 'rgba(46,125,50,0.08)', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center', marginTop: Spacing.md },
  completeBtnText: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  completedText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm, marginTop: Spacing.md },
});
