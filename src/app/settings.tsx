import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Linking,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ImageSlot } from '@/components/ImageSlot';
import { Screen } from '@/components/Screen';
import { type Lang } from '@/lib/dailyTitle';
import { languageName, useI18n } from '@/lib/i18n';
import { sendTestNotification } from '@/lib/notifications';
import { useProfile } from '@/lib/profile';
import { useToast } from '@/lib/toast';
import { ACCENTS, FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const CONTACT_EMAIL = 'todisoartwm@gmail.com';

/**
 * Ouvre un message vers l'email de contact.
 * - Natif (APK) : `mailto:` → ouvre l'app mail par défaut (Gmail si défini ainsi).
 * - Web : ouvre directement la fenêtre de rédaction Gmail (fiable dans un navigateur,
 *   contrairement à `mailto:` qui ne fait rien sans client mail configuré).
 */
function openContactEmail() {
  const subject = encodeURIComponent('Baiboly & Fihirana K&PR');
  if (Platform.OS === 'web') {
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${subject}`;
    if (typeof window !== 'undefined') window.open(gmail, '_blank');
  } else {
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}`).catch(() => {});
  }
}

const SCALE_MIN = 0.85;
const SCALE_MAX = 1.35;

function FontSlider() {
  const { theme, fontScale, setFontScale } = useTheme();
  const widthRef = useRef(0);
  const ratio = (fontScale - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);

  const setFromX = (x: number) => {
    const w = widthRef.current || 1;
    const r = Math.min(1, Math.max(0, x / w));
    setFontScale(SCALE_MIN + r * (SCALE_MAX - SCALE_MIN));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  };

  return (
    <View>
      <View style={styles.sliderRow}>
        <Text style={[styles.sliderAsmall, { color: theme.textFaint }]}>A</Text>
        <View style={styles.trackWrap} onLayout={onLayout} {...pan.panHandlers}>
          <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]} />
          <View style={[styles.trackFill, { backgroundColor: theme.primary, width: `${ratio * 100}%` }]} />
          <View
            style={[
              styles.thumb,
              { left: `${ratio * 100}%`, backgroundColor: theme.surface, borderColor: theme.primary },
            ]}
          />
        </View>
        <Text style={[styles.sliderAbig, { color: theme.text }]}>A</Text>
      </View>
      <Text style={[styles.preview, { color: theme.verse, fontSize: 15 * fontScale }]}>
        « Ny teninao no jiro ho an'ny tongotro… »
      </Text>
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} style={[styles.toggle, { backgroundColor: value ? theme.primary : theme.surfaceAlt }]}>
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { theme, scheme, accentOverride, setMode, setAccentOverride, heroImage, heroBlur, heroLabel } =
    useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const profile = useProfile();
  const toast = useToast();
  const [reminders, setReminders] = useState(true);
  const lang = ((profile.language as Lang) || 'mg') as Lang;

  // Geste caché : 5 appuis rapides sur « Ambiance du jour » → notif de test.
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAmbianceTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapCount.current += 1;
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      sendTestNotification(lang).then((ok) => {
        toast.show(
          ok
            ? { mg: 'Fanairana andrana nalefa.', fr: 'Notification de test envoyée.', en: 'Test notification sent.' }
            : { mg: 'Tsy nalefa (avelao ny fanairana).', fr: "Impossible (autorise les notifications).", en: 'Could not send (allow notifications).' },
        );
      });
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 1500);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{t('settings_title')}</Text>
        <View style={{ width: 88 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profil */}
        <Pressable onPress={() => router.push('/edit-profile')}>
          <LinearGradient
            colors={[theme.heroFrom, theme.heroTo]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.profile, { borderColor: theme.border }]}
          >
            <View style={[styles.pAvatar, { backgroundColor: theme.surfaceAlt, borderColor: theme.surface }]}>
              <ImageSlot source={profile.photoUri} style={styles.pAvatarImg} accessibilityLabel="Sary">
                <Icon name="sunrise" size={26} color={theme.primary} />
              </ImageSlot>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pName, { color: theme.text }]}>{profile.name || t('name_placeholder')}</Text>
              {profile.email ? <Text style={[styles.pEmail, { color: theme.textMuted }]}>{profile.email}</Text> : null}
            </View>
            <View style={[styles.editBtn, { backgroundColor: theme.surface }]}>
              <Icon name="edit" size={16} color={theme.primary} strokeWidth={1.9} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Endrika sy loko */}
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('appearance')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t('app_color')}</Text>
          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode('light')} style={[styles.modeBtn, { backgroundColor: scheme === 'light' ? theme.primary : theme.surfaceAlt }]}>
              <Icon name="sun" size={17} color={scheme === 'light' ? theme.onPrimary : theme.textMuted} strokeWidth={1.9} />
              <Text style={[styles.modeText, { color: scheme === 'light' ? theme.onPrimary : theme.textMuted }]}>{t('light')}</Text>
            </Pressable>
            <Pressable onPress={() => setMode('dark')} style={[styles.modeBtn, { backgroundColor: scheme === 'dark' ? theme.primary : theme.surfaceAlt }]}>
              <Icon name="moon" size={17} color={scheme === 'dark' ? theme.onPrimary : theme.textMuted} strokeWidth={1.9} />
              <Text style={[styles.modeText, { color: scheme === 'dark' ? theme.onPrimary : theme.textMuted }]}>{t('dark')}</Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 4 }]}>{t('base_color')}</Text>
          <Text style={[styles.cardHint, { color: theme.textFaint }]}>
            {accentOverride ? t('tap_reset') : t('from_image')}
          </Text>
          <View style={styles.swatchRow}>
            {ACCENTS.map((c) => {
              const selected = accentOverride === c;
              return (
                <Pressable key={c} onPress={() => setAccentOverride(selected ? null : c)}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      selected && { borderWidth: 2, borderColor: theme.surface, ...swatchRing(c) },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sary sy endrika — ambiance du jour (automatique, lecture seule) */}
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('image_mood')}</Text>
        <Pressable
          onPress={onAmbianceTap}
          style={[
            styles.card,
            styles.ambianceCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
            cardShadow(theme.shadow, 'sm'),
          ]}
        >
          <ImageSlot source={heroImage} blur={heroBlur} style={styles.ambianceImg} accessibilityLabel={heroLabel}>
            <Icon name="sun" size={22} color={theme.textMuted} strokeWidth={1.9} />
          </ImageSlot>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{t('day_mood')}</Text>
            <Text style={[styles.cardHint, { color: theme.textFaint }]}>{t('day_mood_sub')}</Text>
          </View>
        </Pressable>

        {/* Habe soratra */}
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('font_size')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          <FontSlider />
        </View>

        {/* Liste de réglages */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 12, padding: 0 }, cardShadow(theme.shadow, 'sm')]}>
          <View style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
            <View style={[styles.settingIcon, { backgroundColor: theme.chipBg }]}>
              <Icon name="bell" size={17} color={theme.chipText} strokeWidth={1.8} />
            </View>
            <Text style={[styles.settingText, { color: theme.text }]}>{t('reminders')}</Text>
            <Toggle value={reminders} onChange={setReminders} />
          </View>
          <Pressable onPress={() => router.push('/language')} style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
            <View style={[styles.settingIcon, { backgroundColor: theme.cardTealFrom }]}>
              <Icon name="globe" size={17} color={theme.teal} strokeWidth={1.8} />
            </View>
            <Text style={[styles.settingText, { color: theme.text }]}>{t('language')}</Text>
            <Text style={[styles.settingValue, { color: theme.textFaint }]}>{languageName(profile.language)}</Text>
            <Icon name="chevron-right" size={17} color={theme.textFaint} strokeWidth={2.2} />
          </Pressable>
          <Pressable onPress={() => router.push('/about-mofonaina')} style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#F0E0E0' }]}>
              <Icon name="info" size={17} color={theme.accent} strokeWidth={1.8} />
            </View>
            <Text style={[styles.settingText, { color: theme.text }]}>Mofon'aina 2026</Text>
            <Icon name="chevron-right" size={17} color={theme.textFaint} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Contact */}
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>{t('contact_title')}</Text>
        <View style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          <Text style={[styles.contactIntro, { color: theme.textMuted }]}>{t('contact_intro')}</Text>
          <Pressable
            onPress={openContactEmail}
            style={({ pressed }) => [styles.contactRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.cardTealFrom }]}>
              <Icon name="bell" size={16} color={theme.teal} strokeWidth={1.8} />
            </View>
            <Text style={[styles.contactEmail, { color: theme.primary }]}>{CONTACT_EMAIL}</Text>
            <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: theme.textFaint }]}>
          Baiboly & Fihirana K&PR · v{APP_VERSION}{'\n'}© 2026 Todisoa. {t('rights_reserved')}
        </Text>
      </ScrollView>
    </Screen>
  );
}

function swatchRing(color: string): any {
  // Anneau externe façon maquette (outline sur web, ombre nette ailleurs).
  return {
    outlineColor: color,
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
  };
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 21 },
  content: { paddingHorizontal: 22, paddingBottom: SPACING.xl },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderRadius: 22,
    marginTop: 12,
    borderWidth: 1,
  },
  pAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pAvatarImg: { width: '100%', height: '100%', borderRadius: 27 },
  pName: { fontFamily: FONTS.display, fontSize: 18 },
  pEmail: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 2 },
  editBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  card: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 13 },
  cardHint: { fontFamily: FONTS.sansSemi, fontSize: 11, marginTop: 3 },
  ambianceCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ambianceImg: { width: 56, height: 56, borderRadius: 16 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  modeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  modeText: { fontFamily: FONTS.sansExtra, fontSize: 13 },
  divider: { height: 1, marginVertical: 12 },
  swatchRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 10 },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sliderAsmall: { fontFamily: FONTS.sansBold, fontSize: 13 },
  sliderAbig: { fontFamily: FONTS.sansBold, fontSize: 24 },
  trackWrap: { flex: 1, height: 24, justifyContent: 'center' },
  track: { height: 5, borderRadius: 3 },
  trackFill: { position: 'absolute', left: 0, height: 5, borderRadius: 3 },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    marginLeft: -11,
    top: 1,
  },
  preview: { fontFamily: FONTS.serif, marginTop: 10, lineHeight: 22 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 13.5 },
  settingValue: { fontFamily: FONTS.sansSemi, fontSize: 13 },
  footer: { fontFamily: FONTS.sansSemi, fontSize: 11.5, textAlign: 'center', lineHeight: 18, marginTop: 22 },
  contactCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  contactIntro: { fontFamily: FONTS.sansSemi, fontSize: 13, lineHeight: 20 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  contactEmail: { fontFamily: FONTS.sansBold, fontSize: 14.5, flex: 1, textDecorationLine: 'underline' },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
});
