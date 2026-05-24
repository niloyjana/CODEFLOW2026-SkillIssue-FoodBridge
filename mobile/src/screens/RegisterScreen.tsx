import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

const ROLES: { key: UserType; label: string; icon: string }[] = [
  { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { key: 'shelter', label: 'Shelter', icon: '🏠' },
  { key: 'individual', label: 'Individual', icon: '❤️' },
];

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const extra: any = { address: address || undefined, phone: phone || undefined };
      if (role === 'shelter') {
        extra.capacity = Number(capacity) || undefined;
        extra.licenseNumber = licenseNumber || undefined;
      }
      await register(name, email, role, extra);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.logo}><Text style={{ fontSize: 48 }}>🌉</Text><Text style={s.title}>FoodBridge</Text><Text style={s.sub}>Create Account</Text></View>
        <View style={s.card}>
          <View style={s.tabs}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.key} style={[s.tab, role === r.key && s.tabA]} onPress={() => setRole(r.key)}>
                <Text style={{ fontSize: 14 }}>{r.icon}</Text>
                <Text style={[s.tabL, role === r.key && s.tabLA]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.label}>{role === 'individual' ? 'Volunteer Name' : 'Organization Name'}</Text>
          <TextInput style={s.input} placeholder={role === 'restaurant' ? 'e.g. Pizza Palace' : role === 'shelter' ? 'e.g. Hope Shelter' : 'e.g. Alex'} placeholderTextColor={Colors.textLight} value={name} onChangeText={setName} />
          <Text style={s.label}>Email Address</Text>
          <TextInput style={s.input} placeholder="info@org.com" placeholderTextColor={Colors.textLight} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          {role === 'shelter' && (<><Text style={s.label}>Capacity</Text><TextInput style={s.input} placeholder="150" placeholderTextColor={Colors.textLight} value={capacity} onChangeText={setCapacity} keyboardType="numeric" /><Text style={s.label}>License Number</Text><TextInput style={s.input} placeholder="SHELTER-789" placeholderTextColor={Colors.textLight} value={licenseNumber} onChangeText={setLicenseNumber} /></>)}
          {role === 'individual' && (<><Text style={s.label}>Phone</Text><TextInput style={s.input} placeholder="+1 555-0199" placeholderTextColor={Colors.textLight} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></>)}
          <Text style={s.label}>Address</Text>
          <TextInput style={s.input} placeholder="123 Main St" placeholderTextColor={Colors.textLight} value={address} onChangeText={setAddress} />
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>Register</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center', marginTop: Spacing.lg }} onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>Already have an account? <Text style={{ color: Colors.primary, fontWeight: FontWeight.bold }}>Log in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  logo: { alignItems: 'center', marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xxl, ...Shadow.lg, borderWidth: 1, borderColor: Colors.border },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: Radius.sm, padding: Spacing.xs, marginBottom: Spacing.xl },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6, gap: 4 },
  tabA: { backgroundColor: Colors.surface, ...Shadow.sm },
  tabL: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabLA: { color: Colors.primary, fontWeight: FontWeight.bold },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.sm, padding: 14, fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.lg },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm, ...Shadow.md },
  btnT: { color: '#FFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
