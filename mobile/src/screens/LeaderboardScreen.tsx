import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

type Tab = 'restaurants' | 'shelters' | 'individuals';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { key: 'shelters', label: 'Shelters', icon: '🏠' },
  { key: 'individuals', label: 'Individuals', icon: '❤️' },
];

export default function LeaderboardScreen() {
  const { restaurantLeaderboard, shelterLeaderboard, individualLeaderboard, loading, refresh } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<Tab>('restaurants');

  const data = activeTab === 'restaurants' ? restaurantLeaderboard : activeTab === 'shelters' ? shelterLeaderboard : individualLeaderboard;

  const getRankColor = (i: number) => i === 0 ? Colors.gold : i === 1 ? Colors.silver : i === 2 ? Colors.bronze : Colors.textLight;
  const getRankEmoji = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />}>
      <Text style={s.title}>🏆 Community Leaderboard</Text>
      <Text style={s.subtitle}>Recognizing local heroes saving food waste.</Text>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={[s.tab, activeTab === tab.key && s.tabActive]} onPress={() => setActiveTab(tab.key)}>
            <Text style={{ fontSize: 14 }}>{tab.icon}</Text>
            <Text style={[s.tabLabel, activeTab === tab.key && s.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium for top 3 */}
      {data.length >= 3 && (
        <View style={s.podium}>
          {/* 2nd */}
          <View style={[s.podiumItem, { marginTop: 20 }]}>
            <Text style={s.podiumEmoji}>🥈</Text>
            <Text style={s.podiumName} numberOfLines={1}>{data[1].name}</Text>
            <Text style={[s.podiumPts, { color: Colors.silver }]}>{data[1].points} pts</Text>
          </View>
          {/* 1st */}
          <View style={s.podiumItem}>
            <Text style={[s.podiumEmoji, { fontSize: 32 }]}>🥇</Text>
            <Text style={[s.podiumName, { fontWeight: FontWeight.extrabold }]} numberOfLines={1}>{data[0].name}</Text>
            <Text style={[s.podiumPts, { color: Colors.gold, fontSize: FontSize.lg }]}>{data[0].points} pts</Text>
          </View>
          {/* 3rd */}
          <View style={[s.podiumItem, { marginTop: 30 }]}>
            <Text style={s.podiumEmoji}>🥉</Text>
            <Text style={s.podiumName} numberOfLines={1}>{data[2].name}</Text>
            <Text style={[s.podiumPts, { color: Colors.bronze }]}>{data[2].points} pts</Text>
          </View>
        </View>
      )}

      {/* Full List */}
      <View style={s.listCard}>
        {data.map((entry, i) => (
          <View key={entry.id} style={[s.row, i < data.length - 1 && s.rowBorder]}>
            <View style={[s.rankBadge, { backgroundColor: getRankColor(i) + '20' }]}>
              <Text style={[s.rankText, { color: getRankColor(i) }]}>{getRankEmoji(i)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.entryName}>{entry.name}</Text>
              <Text style={s.entryMeta}>
                {entry.completedPickups} pickups
                {activeTab === 'restaurants' && entry.totalKgSaved !== undefined ? ` · ${entry.totalKgSaved.toFixed(1)} kg saved` : ''}
                {activeTab === 'shelters' && entry.peopleServed ? ` · ${entry.peopleServed} served` : ''}
              </Text>
              {activeTab === 'individuals' && entry.badges && entry.badges.length > 0 && (
                <View style={s.badgesRow}>
                  {entry.badges.map((b, bi) => (
                    <View key={bi} style={s.badgeChip}><Text style={s.badgeChipText}>{b}</Text></View>
                  ))}
                </View>
              )}
            </View>
            <Text style={s.entryPts}>{entry.points} pts</Text>
          </View>
        ))}
        {data.length === 0 && <Text style={s.emptyText}>No entries yet.</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.xs, marginBottom: Spacing.xl, ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: Radius.sm, gap: 4 },
  tabActive: { backgroundColor: Colors.primaryGlow, ...Shadow.sm },
  tabLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabLabelActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: Spacing.xxl, gap: Spacing.md },
  podiumItem: { alignItems: 'center', flex: 1 },
  podiumEmoji: { fontSize: 24, marginBottom: 4 },
  podiumName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  podiumPts: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold },
  listCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md, borderWidth: 1, borderColor: Colors.borderLight },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rankBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold },
  entryName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  entryMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  entryPts: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold, color: Colors.primary },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  badgeChip: { backgroundColor: Colors.primaryGlow, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeChipText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.primary },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, fontSize: FontSize.sm, paddingVertical: Spacing.xl },
});
