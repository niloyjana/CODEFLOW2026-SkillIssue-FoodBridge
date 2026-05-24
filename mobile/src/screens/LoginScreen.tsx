import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

const ROLES: { key: UserType; label: string; icon: string }[] = [
  { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { key: 'shelter', label: 'Shelter', icon: '🏠' },
  { key: 'individual', label: 'Individual', icon: '❤️' },
];

const QUICK_LOGINS = [
  { role: 'restaurant' as UserType, email: 'restaurant@foodbridge.com', label: 'Restaurant', icon: '🍽️' },
  { role: 'shelter' as UserType, email: 'shelter@foodbridge.com', label: 'Shelter', icon: '🏠' },
  { role: 'individual' as UserType, email: 'individual@foodbridge.com', label: 'Individual', icon: '❤️' },
];

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await login(email, role);
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err?.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserType, emailAddr: string) => {
    setLoading(true);
    try {
      await login(emailAddr, selectedRole);
    } catch (err: any) {
      console.error('Quick login error:', err);
      Alert.alert('Login Failed', err?.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 10 }} />
          <Text style={styles.logoTitle}>FoodBridge</Text>
          <Text style={styles.logoSubtitle}>Welcome Back</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Role Tabs */}
          <View style={styles.roleTabs}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleTab, role === r.key && styles.roleTabActive]}
                onPress={() => setRole(r.key)}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text
                  style={[
                    styles.roleLabel,
                    role === r.key && styles.roleLabelActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder={
              role === 'restaurant'
                ? 'restaurant@foodbridge.com'
                : role === 'shelter'
                ? 'shelter@foodbridge.com'
                : 'individual@foodbridge.com'
            }
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Quick Logins */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Demo Logins</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickLoginRow}>
            {QUICK_LOGINS.map((q) => (
              <TouchableOpacity
                key={q.role}
                style={styles.quickLoginBtn}
                onPress={() => handleQuickLogin(q.role, q.email)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.quickLoginIcon}>{q.icon}</Text>
                <Text style={styles.quickLoginLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerBold}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  logoTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  logoSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm - 2,
    gap: 4,
  },
  roleTabActive: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  roleIcon: {
    fontSize: 14,
  },
  roleLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  roleLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  label: {
    fontSize: FontSize.sm,
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
    padding: Spacing.md + 2,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(0,0,0,0.01)',
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickLoginRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickLoginBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(46,125,50,0.03)',
  },
  quickLoginIcon: {
    fontSize: 12,
  },
  quickLoginLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  registerBold: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
