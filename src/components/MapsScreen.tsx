import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  MapRef,
  OfflineManager,
  OfflinePack,
  TransformRequestManager,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AREA_SIZES,
  AreaSizeId,
  Bounds,
  boundsAround,
  MAP_STYLE,
  outlineOf,
  planDownload,
} from '../lib/map-areas';
import { locate } from '../lib/locate';
import { findState, getProfile } from '../lib/place';
import { useTheme } from '../lib/theme';
import { Button, Text } from './ui';

// OpenFreeMap asks apps that save maps offline to identify themselves.
TransformRequestManager.addHeader({
  id: 'last-app-user-agent',
  name: 'User-Agent',
  value: 'LastApp/1.0 (offline preparedness guide)',
});
// Room for several saved areas on one phone.
OfflineManager.setTileCountLimit(40000);

type Saved = { id: string; name: string; bounds: Bounds; megabytes: number };
const USA: [number, number] = [-96, 38.5]; // middle of the US until we know better

/** Open on the person's own state if they told us, so the map starts somewhere useful. */
function startView(): { center: [number, number]; zoom: number } {
  const st = findState(getProfile()?.state);
  return st ? { center: [st.lon, st.lat], zoom: 6 } : { center: USA, zoom: 3 };
}

// Offline maps: move the map to the place you care about, pick how big an
// area to keep, and save it. Saved areas work with no signal.
export function MapsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const map = useRef<MapRef>(null);
  const camera = useRef<CameraRef>(null);

  const start = useMemo(startView, []);
  const [center, setCenter] = useState<[number, number]>(start.center);
  const [sizeId, setSizeId] = useState<AreaSizeId>('town');
  const [picking, setPicking] = useState(false); // is the "save an area" panel open?
  const [saved, setSaved] = useState<Saved[]>([]);
  const [progress, setProgress] = useState<number | null>(null); // 0-100 while saving
  const [located, setLocated] = useState(false);

  const size = AREA_SIZES.find((s) => s.id === sizeId)!;
  const bounds = useMemo(() => boundsAround(center[0], center[1], size.miles), [center, size]);
  const plan = useMemo(() => planDownload(bounds), [bounds]);

  // ----- Saved areas -----
  const refreshSaved = useCallback(async () => {
    try {
      const packs = await OfflineManager.getPacks();
      setSaved(
        packs.map((p: OfflinePack) => ({
          id: p.id,
          name: String(p.metadata?.name ?? 'Saved area'),
          bounds: p.bounds as Bounds,
          megabytes: Number(p.metadata?.megabytes ?? 0),
        })),
      );
    } catch {
      // the map engine isn't ready yet; the list just stays empty
    }
  }, []);
  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  // ----- Where am I -----
  const goToMe = useCallback(async (quiet = false) => {
    const fix = await locate();
    if (!fix) {
      if (quiet) return; // opening the tab shouldn't pop an alert
      Alert.alert(
        'Couldn’t find you',
        'You can still move the map by hand. To show where you are, allow location for Last App in Settings and step outside for a clear view of the sky.',
      );
      return;
    }
    setLocated(true);
    const here: [number, number] = [fix.lon, fix.lat];
    setCenter(here);
    camera.current?.flyTo({ center: here, zoom: 11, duration: 1200 });
  }, []);
  useEffect(() => {
    goToMe(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the planned area centered on whatever the map is looking at.
  const onMoved = async () => {
    try {
      const c = await map.current?.getCenter();
      if (c) setCenter([c[0], c[1]]);
    } catch {
      // ignore: we'll get the next one
    }
  };

  // ----- Saving -----
  const save = async () => {
    if (progress !== null) return;
    setProgress(0);
    const name = `${size.label} · ${new Date().toLocaleDateString()}`;
    try {
      await OfflineManager.createPack(
        {
          mapStyle: MAP_STYLE,
          bounds,
          minZoom: plan.minZoom,
          maxZoom: plan.maxZoom,
          metadata: { name, megabytes: plan.megabytes },
        },
        (_pack, status) => {
          setProgress(Math.round(Number(status.percentage)));
          if (status.state === 'complete') {
            setProgress(null);
            setPicking(false);
            refreshSaved();
          }
        },
        () => {
          setProgress(null);
          refreshSaved();
          Alert.alert(
            'The map didn’t finish saving',
            'This usually means a shaky connection. What was saved is kept. Try again when you have signal.',
          );
        },
      );
    } catch {
      setProgress(null);
      Alert.alert('Couldn’t start saving', 'Please check your connection and try again.');
    }
  };

  const remove = (area: Saved) =>
    Alert.alert('Remove this saved map?', 'You’ll need internet to save it again.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await OfflineManager.deletePack(area.id).catch(() => {});
          refreshSaved();
        },
      },
    ]);

  // Leave room for the clock at the top so the box is never hidden under it.
  const show = (b: Bounds) =>
    camera.current?.fitBounds(b, {
      duration: 900,
      padding: { top: insets.top + 24, right: 24, bottom: 24, left: 24 },
    });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Map
        ref={map}
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE}
        logo={false}
        attribution={false} // the credit line is written out in the panel below instead
        onRegionDidChange={onMoved}
      >
        <Camera ref={camera} initialViewState={start} />
        {located && <UserLocation />}
        {picking && (
          <GeoJSONSource id="area-outline" data={outlineOf(bounds)}>
            <Layer
              id="area-fill"
              type="fill"
              paint={{ 'fill-color': '#1F5C4A', 'fill-opacity': 0.12 }}
            />
            <Layer
              id="area-line"
              type="line"
              paint={{ 'line-color': '#1F5C4A', 'line-width': 3 }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {/* "Find me" button */}
      <Pressable
        onPress={() => goToMe()}
        accessibilityLabel="Show where I am"
        style={[s.fab, { top: insets.top + 12, backgroundColor: t.card }]}
      >
        <Ionicons name="locate" size={22} color={t.accent} />
      </Pressable>

      {/* Bottom panel */}
      <View style={[s.panel, { backgroundColor: t.card }]}>
        {!picking ? (
          <>
            <Text style={[s.title, { color: t.text }]}>Offline maps</Text>
            {saved.length === 0 ? (
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
                Save the places that matter to you (home, family, your way out of town) and they’ll
                work with no signal.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 150 }}>
                {saved.map((a) => (
                  <View key={a.id} style={[s.savedRow, { borderBottomColor: t.border }]}>
                    <Pressable onPress={() => show(a.bounds)} style={s.savedMain}>
                      <Ionicons name="checkmark-circle" size={22} color={t.good} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>
                          {a.name}
                        </Text>
                        <Text style={{ color: t.muted, fontSize: 15 }}>
                          Saved{a.megabytes ? ` · about ${a.megabytes} MB` : ''} · tap to view
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => remove(a)}
                      hitSlop={10}
                      accessibilityLabel="Remove saved map"
                    >
                      <Ionicons name="trash-outline" size={20} color={t.muted} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
            <Button
              label={saved.length ? 'Save another area' : 'Save an area'}
              onPress={() => {
                setPicking(true);
                // Zoom so the green box fills the screen instead of being a dot.
                show(bounds);
              }}
            />
          </>
        ) : (
          <>
            <Text style={[s.title, { color: t.text }]}>Save this area</Text>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
              Move the map so the green box covers the place you want, then pick a size.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={s.sizes}>
                {AREA_SIZES.map((opt) => {
                  const on = opt.id === sizeId;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        setSizeId(opt.id);
                        show(boundsAround(center[0], center[1], opt.miles));
                      }}
                      style={[s.size, { backgroundColor: on ? t.accent : t.soft }]}
                    >
                      <Text
                        style={{
                          color: on ? t.accentText : t.text,
                          fontSize: 15,
                          fontWeight: '700',
                        }}
                      >
                        {opt.label}
                      </Text>
                      <Text style={{ color: on ? t.accentText : t.text, fontSize: 13 }}>
                        {opt.miles} mi each way
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
              About {plan.megabytes} MB ·{' '}
              {plan.streetLevel ? 'street-level detail' : 'main roads and towns (less detail)'}
            </Text>
            {progress !== null ? (
              <>
                <View style={[s.barBg, { backgroundColor: t.soft }]}>
                  <View style={[s.bar, { width: `${progress}%`, backgroundColor: t.accent }]} />
                </View>
                <Text style={{ color: t.text, fontSize: 15 }}>
                  Saving the map… {progress}%. Keep the app open.
                </Text>
              </>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button
                  label="Cancel"
                  kind="secondary"
                  onPress={() => setPicking(false)}
                  style={{ flex: 1 }}
                />
                <Button label="Save for offline" onPress={save} style={{ flex: 2 }} />
              </View>
            )}
          </>
        )}
        <Text style={{ color: t.text, fontSize: 13 }}>
          Map data © OpenStreetMap contributors · OpenFreeMap
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#17352C',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  panel: {
    padding: 16,
    gap: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#17352C',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: '800' },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  savedMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sizes: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  size: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
