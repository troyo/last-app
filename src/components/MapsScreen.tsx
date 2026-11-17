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
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import {
  DEFAULT_PLACES,
  formatMiles,
  NearbyPlace,
  nearestPlaces,
  PLACE_CATEGORIES,
  PLACE_COLOR_EXPR,
  PLACE_LETTER_EXPR,
  PlaceCategoryId,
  PLACES_LABEL_LAYER,
  PLACES_LAYER,
  PLACES_MIN_ZOOM,
  PLACES_SOURCE,
  PLACES_SOURCE_LAYER,
  placesFilter,
} from '../lib/map-places';
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
  const [me, setMe] = useState<[number, number] | null>(null); // last GPS fix
  const [shown, setShown] = useState<PlaceCategoryId[]>(DEFAULT_PLACES);
  const [nearby, setNearby] = useState<NearbyPlace[] | null>(null); // null = list closed
  const [finding, setFinding] = useState(false);
  const [ready, setReady] = useState(false); // has the map drawn its first full view?
  const moved = useRef(false); // has GPS already sent the map somewhere useful?
  const filter = useMemo(() => placesFilter(shown), [shown]);

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

  // Open on a saved area rather than the whole country, until GPS finds you.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || moved.current || !saved.length) return;
    opened.current = true;
    const b = saved[0].bounds;
    setCenter([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]);
    setTimeout(() => {
      if (!moved.current) show(b, 0);
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  // Never leave the spinner up for good if the map can't say it's finished.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 15000);
    return () => clearTimeout(timer);
  }, []);

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
    moved.current = true;
    const here: [number, number] = [fix.lon, fix.lat];
    setMe(here);
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

  // ----- Emergency places -----
  const toggle = (id: PlaceCategoryId) =>
    setShown((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));

  // The nearest places on the map right now. Places only draw from zoom 12, so
  // zoom in first if we're further out, then read what the map is showing.
  const findNearby = async () => {
    if (finding) return;
    setFinding(true);
    try {
      const zoom = (await map.current?.getZoom()) ?? 0;
      const from = me ?? center;
      if (zoom < 13.5) {
        camera.current?.flyTo({ center: from, zoom: 14, duration: 900 });
        await new Promise((r) => setTimeout(r, 1800)); // let the new tiles draw
      }
      // Tiles can still be drawing just after the zoom, so look again a couple of times.
      let list: NearbyPlace[] = [];
      for (let tries = 0; tries < 3 && list.length === 0; tries++) {
        if (tries) await new Promise((r) => setTimeout(r, 1200));
        const features =
          (await map.current?.queryRenderedFeatures({ layers: [PLACES_LAYER] })) ?? [];
        list = nearestPlaces(features, from);
      }
      setNearby(list);
    } catch {
      setNearby([]);
    } finally {
      setFinding(false);
    }
  };

  const goTo = (p: NearbyPlace) =>
    camera.current?.flyTo({ center: p.coord, zoom: 16, duration: 900 });

  // Leave room for the clock at the top so the box is never hidden under it.
  const show = (b: Bounds, duration = 900) =>
    camera.current?.fitBounds(b, {
      duration,
      padding: { top: insets.top + 24, right: 24, bottom: 24, left: 24 },
    });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flex: 1 }}>
        <Map
          ref={map}
          style={{ flex: 1 }}
          mapStyle={MAP_STYLE}
          logo={false}
          attribution={false} // the credit line is written out in the panel below instead
          onRegionDidChange={onMoved}
          onDidFinishRenderingMapFully={() => setReady(true)}
          onDidFailLoadingMap={() => setReady(true)}
        >
          <Camera ref={camera} initialViewState={start} />
          {/* Emergency places, drawn from the same tiles a saved area keeps offline. */}
          <Layer
            id={PLACES_LAYER}
            type="circle"
            source={PLACES_SOURCE}
            source-layer={PLACES_SOURCE_LAYER}
            minzoom={PLACES_MIN_ZOOM}
            filter={filter}
            paint={{
              'circle-color': PLACE_COLOR_EXPR,
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 7, 14, 12, 16, 15],
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2.5,
            }}
          />
          <Layer
            id={PLACES_LABEL_LAYER}
            type="symbol"
            source={PLACES_SOURCE}
            source-layer={PLACES_SOURCE_LAYER}
            minzoom={PLACES_MIN_ZOOM + 1}
            filter={filter}
            layout={{
              'text-field': PLACE_LETTER_EXPR,
              'text-font': ['Noto Sans Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 16, 14],
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            }}
            paint={{ 'text-color': '#FFFFFF' }}
          />
          <Layer
            id={`${PLACES_LABEL_LAYER}-name`}
            type="symbol"
            source={PLACES_SOURCE}
            source-layer={PLACES_SOURCE_LAYER}
            minzoom={14.5}
            filter={filter}
            layout={{
              'text-field': ['coalesce', ['get', 'name'], ''],
              'text-font': ['Noto Sans Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 14.5, 13, 17, 16],
              'text-anchor': 'top',
              'text-offset': [0, 1.1],
              'text-max-width': 9,
            }}
            paint={{
              'text-color': '#14231D',
              'text-halo-color': '#FFFFFF',
              'text-halo-width': 2,
            }}
          />
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
        {!ready && (
          <View pointerEvents="none" style={[s.loading, { backgroundColor: t.bg }]}>
            <ActivityIndicator size="large" color={t.accent} />
            <Text style={{ color: t.text, fontSize: 16, marginTop: 10 }}>Loading the map…</Text>
          </View>
        )}
      </View>

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
            <View style={s.placesHead}>
              <Text style={[s.title, { color: t.text, flex: 1 }]}>Emergency places</Text>
              <Pressable
                onPress={nearby ? () => setNearby(null) : findNearby}
                style={[s.nearBtn, { backgroundColor: nearby ? t.soft : t.accent }]}
                accessibilityRole="button"
              >
                <Ionicons
                  name={nearby ? 'close' : 'navigate'}
                  size={16}
                  color={nearby ? t.text : t.accentText}
                />
                <Text
                  style={{ color: nearby ? t.text : t.accentText, fontSize: 15, fontWeight: '700' }}
                >
                  {nearby ? 'Close' : finding ? 'Looking…' : 'Near me'}
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // Edge to edge, so chips scroll off the screen, not into the panel's padding.
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              style={{ flexGrow: 0, marginHorizontal: -16 }}
            >
              {PLACE_CATEGORIES.map((c) => {
                const on = shown.includes(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggle(c.id)}
                    style={[
                      s.chip,
                      { backgroundColor: on ? c.color : t.soft, borderColor: c.color },
                    ]}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: on }}
                  >
                    <View style={[s.chipDot, { backgroundColor: on ? '#FFFFFF' : c.color }]} />
                    <Text
                      style={{ color: on ? '#FFFFFF' : t.text, fontSize: 15, fontWeight: '700' }}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {nearby && (
              <ScrollView style={{ maxHeight: 220 }}>
                {nearby.length === 0 ? (
                  <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                    No places in view. Move the map to a town, zoom in, or switch on more types
                    above.
                  </Text>
                ) : (
                  nearby.map((p) => (
                    <Pressable
                      key={p.key}
                      onPress={() => goTo(p)}
                      style={[s.nearRow, { borderBottomColor: t.border }]}
                    >
                      <View style={[s.pin, { backgroundColor: p.category.color }]}>
                        <Text style={s.pinText}>{p.category.letter}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ color: t.text, fontSize: 16, fontWeight: '700' }}
                          numberOfLines={1}
                        >
                          {p.name}
                        </Text>
                        <Text style={{ color: t.text, fontSize: 14 }}>
                          {p.category.one} · {formatMiles(p.miles)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={t.text} />
                    </Pressable>
                  ))
                )}
              </ScrollView>
            )}
            <Text style={{ color: t.text, fontSize: 13, lineHeight: 18 }}>
              From OpenStreetMap and may be out of date. Official storm shelters are announced
              locally; schools and community centres are the usual sites.
            </Text>
            {/* While the places list is open, give it the room and keep the map visible. */}
            {!nearby && (
              <>
                <Text style={[s.title, { color: t.text }]}>Offline maps</Text>
                {saved.length === 0 ? (
                  <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
                    Save the places that matter to you (home, family, your way out of town) and
                    they’ll work with no signal.
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
                    // Zoom so the green box fills the screen instead of being a dot. Wait a
                    // moment for the panel to switch, or the camera ignores the request.
                    setTimeout(() => show(bounds), 150);
                  }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Text style={[s.title, { color: t.text }]}>Save this area</Text>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
              Move the map so the green box covers the place you want, then pick a size.
            </Text>
            {/* A 2x2 grid of sizes, so none is cut off at the screen edge. */}
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
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {opt.label}
                    </Text>
                    <Text style={{ color: on ? t.accentText : t.text, fontSize: 13 }}>
                      {opt.miles} mi around
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
              About {plan.megabytes} MB ·{' '}
              {plan.streetLevel ? 'street-level detail' : 'main roads and towns (less detail)'}
              {plan.places
                ? ' · includes emergency places'
                : '. Emergency places are only saved in Neighborhood and Town sizes.'}
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
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 20, // the panel overlaps the bottom of the map
    alignItems: 'center',
    justifyContent: 'center',
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
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: { width: '48.5%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  placesHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
  },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  nearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
