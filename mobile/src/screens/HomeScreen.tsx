import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const stats = [
    { value: '2,480 kg', label: 'Surplus Saved', color: Colors.primary },
    { value: '9,820+', label: 'Portions Distributed', color: Colors.secondary },
    { value: '98.6%', label: 'Coordination Rate', color: Colors.accent },
  ];

  const steps = [
    { num: '01', title: 'Restaurants Share Surplus', desc: 'Post surplus food with quantity and pickup details.', color: Colors.primary },
    { num: '02', title: 'Volunteers Claim & Coordinate', desc: 'Browse nearby listings and claim food for pickup.', color: Colors.accent },
    { num: '03', title: 'Community Impact Earned', desc: 'Earn points and climb the gamified leaderboard.', color: Colors.secondary },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>
          Bridging the Gap Between{' '}
          <Text style={{ color: Colors.primary }}>Surplus Food</Text>
          {' '}and{' '}
          <Text style={{ color: Colors.primary }}>Communities</Text>
        </Text>
        <Text style={s.heroSub}>
          Optimize surplus meals, minimize waste, and distribute claims instantly with local volunteers.
        </Text>
        <View style={s.heroButtons}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => {
            if (user) {
              if (user.type === 'restaurant') navigation.navigate('RestaurantTab');
              else if (user.type === 'shelter') navigation.navigate('ShelterTab');
              else navigation.navigate('IndividualTab');
            } else {
              navigation.navigate('Login');
            }
          }}>
            <Text style={s.primaryBtnText}>{user ? 'Go to Dashboard' : 'Get Started'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secBtn} onPress={() => navigation.navigate('LeaderboardTab')}>
            <Text style={s.secBtnText}>🏆 Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {stats.map((st, i) => (
          <View key={i} style={[s.statCard, { borderTopColor: st.color, borderTopWidth: 3 }]}>
            <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <Text style={s.sectionTitle}>How FoodBridge Works</Text>
      <Text style={s.sectionSub}>Learn how we bridge food resources to community needs.</Text>
      {steps.map((step, i) => (
        <View key={i} style={s.stepCard}>
          <View style={[s.stepNum, { backgroundColor: step.color + '18' }]}>
            <Text style={[s.stepNumText, { color: step.color }]}>{step.num}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.stepTitle}>{step.title}</Text>
            <Text style={s.stepDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>FoodBridge © 2026 · Made with 💚</Text>
        <Text style={s.footerSmall}>AI Waste Engine v1.2  |  Zero Hunger Initiative</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  hero: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xxl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadow.md },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', lineHeight: 32, marginBottom: Spacing.md },
  heroSub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  heroButtons: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'center' },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: 20, ...Shadow.sm },
  primaryBtnText: { color: '#FFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  secBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: 20 },
  secBtnText: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.md },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxxl },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, marginBottom: 4 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semibold, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  stepCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.md, alignItems: 'flex-start', ...Shadow.sm, borderWidth: 1, borderColor: Colors.borderLight },
  stepNum: { borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  stepNumText: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  stepTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  stepDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  footer: { alignItems: 'center', marginTop: Spacing.xxxl, paddingTop: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  footerSmall: { fontSize: FontSize.xs, color: Colors.textLight },
});
