import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ImageSlot } from '@/components/ImageSlot';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { setProfile, useProfile } from '@/lib/profile';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const goBack = useSafeBack('/settings');
  const profile = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [photo, setPhoto] = useState<string | null>(profile.photoUri);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets[0];
      setPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
    }
  };

  const save = () => {
    setProfile({ name: name.trim(), email: email.trim(), photoUri: photo });
    goBack();
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{t('edit_profile')}</Text>
        <View style={{ width: 88 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Photo */}
        <View style={styles.photoWrap}>
          <View style={[styles.avatar, { backgroundColor: theme.surfaceAlt, borderColor: theme.surface }]}>
            <ImageSlot source={photo} style={styles.avatarImg} accessibilityLabel="Sary">
              <Icon name="sunrise" size={40} color={theme.primary} />
            </ImageSlot>
          </View>
          <Pressable onPress={pickPhoto} style={[styles.photoBtn, { backgroundColor: theme.chipBg }]}>
            <Icon name="edit" size={15} color={theme.chipText} strokeWidth={1.9} />
            <Text style={[styles.photoBtnText, { color: theme.chipText }]}>{t('change_photo')}</Text>
          </Pressable>
          {photo ? (
            <Pressable onPress={() => setPhoto(null)} hitSlop={6}>
              <Text style={[styles.removePhoto, { color: theme.accent }]}>{t('remove_photo')}</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Nom */}
        <Text style={[styles.label, { color: theme.textFaint }]}>{t('name').toUpperCase()}</Text>
        <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('name_placeholder')}
            placeholderTextColor={theme.textFaint}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        {/* Email */}
        <Text style={[styles.label, { color: theme.textFaint }]}>{t('email').toUpperCase()}</Text>
        <View style={[styles.field, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nom@email.com"
            placeholderTextColor={theme.textFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        <Pressable onPress={save} style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }, cardShadow(theme.primary, 'md')]}>
          <Text style={[styles.saveText, { color: theme.onPrimary }]}>{t('save')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 20 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 10, paddingBottom: SPACING.xl },
  photoWrap: { alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 48 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999 },
  photoBtnText: { fontFamily: FONTS.sansExtra, fontSize: 13 },
  removePhoto: { fontFamily: FONTS.sansBold, fontSize: 12 },
  label: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 18, marginBottom: 8 },
  field: { height: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, justifyContent: 'center' },
  input: { fontFamily: FONTS.sansSemi, fontSize: 15, paddingVertical: 0 },
  saveBtn: { marginTop: 28, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: FONTS.sansExtra, fontSize: 16, letterSpacing: 0.5 },
});
