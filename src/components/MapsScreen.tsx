import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  CameraRef,
  GeoJSONSource,
  GeoJSONSourceRef,
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
import { canLocateQuietly, locate } from '../lib/locate';
import { findState, getProfile } from '../lib/place';
import {
  boxAround,
  byKind,
  directionTo,
  formatMiles,
  kindOf,
  KINDS,
  milesBetween,
  nearest,
  Nearby,
  Place,
  PlaceKind,
  placeById,
  placesNear,
  shortDirection,
  toFeatures,
} from '../lib/places-db';
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
type LonLat = [number, number];
const USA: LonLat = [-96, 38.5]; // middle of the US until we know better

// The three things people look for first when things go wrong.
const QUICK: PlaceKind[] = ['hospital', 'shelter', 'water'];

/** Open on the person's own state if they told us, so the map starts somewhere useful. */
function startView(): { center: LonLat; zoom: number } {
  const st = findState(getProfile()?.state);
  return st ? { center: [st.lon, st.lat], zoom: 6 } : { center: USA, zoom: 3 };
}

/** Which part of the country to draw places for: the view, but never the whole map at once. */
function placesBox(view: number[], center: LonLat) {
  const wide = view[2] - view[0] > 12 || view[3] - view[1] > 8;
  return wide ? boxAround(center, 250) : view;
}

// Offline maps plus emergency places. The places ship inside the app, so the pins
// and the "nearest" answers work anywhere in the US with no signal, even before
// any area is saved. Saved areas add the streets underneath.
export function MapsScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const map = useRef<MapRef>(null);
  const camera = useRef<CameraRef>(null);
  const others = useRef<GeoJSONSourceRef>(null);
  const hospitalSource = useRef<GeoJSONSourceRef>(null);

  const start = useMemo(startView, []);
  const [center, setCenter] = useState<LonLat>(start.center);
  const [view, setView] = useState<number[]>(boxAround(start.center, 150));
  const [sizeId, setSizeId] = useState<AreaSizeId>('town');
  const [picking, setPicking] = useState(false); // is the "save an area" panel open?
  const [saved, setSaved] = useState<Saved[]>([]);
  const [progress, setProgress] = useState<number | null>(null); // 0-100 while saving
  const [located, setLocated] = useState(false);
  const [me, setMe] = useState<LonLat | null>(null); // last GPS fix
  const [shown, setShown] = useState<PlaceKind[]>(KINDS.filter((k) => k.on).map((k) => k.id));
  const [picked, setPicked] = useState<Place | null>(null); // the place whose card is open
  const [ready, setReady] = useState(false); // has the map drawn its first full view?
  const moved = useRef(false); // has GPS already sent the map somewhere useful?

  const size = AREA_SIZES.find((s) => s.id === sizeId)!;
  const bounds = useMemo(() => boundsAround(center[0], center[1], size.miles), [center, size]);
  const plan = useMemo(() => planDownload(bounds), [bounds]);

  // Distances are from you when we know where you are, otherwise from the map's middle.
  const from: LonLat = me ?? center;
  const fromWords = me ? 'from you' : 'from the middle of the map';

  // ----- Places on the map -----
  const box = useMemo(() => placesBox(view, center), [view, center]);
  const visible = useMemo(() => {
    const all = placesNear(box).filter((p) => shown.includes(p.kind));
    // A place you picked stays on the map even if its kind is switched off.
    return picked && !all.some((p) => p.id === picked.id) ? [...all, picked] : all;
  }, [box, shown, picked]);
  const hospitals = useMemo(() => toFeatures(visible.filter((p) => p.kind === 'hospital')), [visible]);
  const rest = useMemo(() => toFeatures(visible.filter((p) => p.kind !== 'hospital')), [visible]);
  const pickedFeature = useMemo(() => toFeatures(picked ? [picked] : []), [picked]);

  // The nearest hospital, shelter and water: the answers people need first.
  const quick = useMemo(
    () => QUICK.map((kind) => ({ kind, place: nearest(from, kind, 1)[0] as Nearby | undefined })),
    // Recompute when "from" moves meaningfully, not on every tiny pan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Math.round(from[0] * 100), Math.round(from[1] * 100)],
  );

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

  // Leave room for the clock at the top so the box is never hidden under it.
  const show = (b: Bounds, duration = 900) =>
    camera.current?.fitBounds(b, {
      duration,
      padding: { top: insets.top + 24, right: 24, bottom: 24, left: 24 },
    });

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
    const here: LonLat = [fix.lon, fix.lat];
    setMe(here);
    setCenter(here);
    camera.current?.flyTo({ center: here, zoom: 12, duration: 1200 });
  }, []);
  useEffect(() => {
    // Only find you on opening if you've already allowed it; otherwise wait
    // for a tap on the locate button, so the prompt never appears unasked.
    if (canLocateQuietly()) goToMe(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the places and the planned area in step with whatever the map shows.
  const onMoved = (e: { nativeEvent: { center: number[]; bounds: number[] } }) => {
    const { center: c, bounds: b } = e.nativeEvent;
    if (c) setCenter([c[0], c[1]]);
    if (b) setView([b[0], b[1], b[2], b[3]]);
  };

  // ----- Picking a place -----
  const focus = (p: Place, zoom = 15) => {
    setPicked(p);
    camera.current?.flyTo({ center: [p.lon, p.lat], zoom, duration: 900 });
  };

  const onPlacePress = async (
    e: { nativeEvent: { features: GeoJSON.Feature[] } },
    source: React.RefObject<GeoJSONSourceRef | null>,
  ) => {
    const f = e.nativeEvent.features?.[0];
    if (!f) return;
    const props = (f.properties ?? {}) as Record<string, unknown>;
    if (props.cluster) {
      // A bubble of several places: zoom in until they come apart.
      const coords = (f.geometry as GeoJSON.Point).coordinates as LonLat;
      const zoom = await source.current
        ?.getClusterExpansionZoom(Number(props.cluster_id))
        .catch(() => undefined);
      camera.current?.flyTo({ center: coords, zoom: (zoom ?? 12) + 0.5, duration: 700 });
      return;
    }
    const p = placeById(Number(props.id));
    if (p) setPicked(p);
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

  const toggle = (id: PlaceKind) =>
    setShown((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));

  const pickedKind = picked ? kindOf(picked.kind) : undefined;
  const pickedMiles = picked ? milesBetween(from, [picked.lon, picked.lat]) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flex: 1 }}>
        <Map
          ref={map}
          style={{ flex: 1 }}
          mapStyle={MAP_STYLE}
          logo={false}
          attribution={false} // the credit line is written out in the panel below instead
          compass
          onRegionDidChange={onMoved}
          onDidFinishRenderingMapFully={() => setReady(true)}
          onDidFailLoadingMap={() => setReady(true)}
        >
          <Camera ref={camera} initialViewState={start} />

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

          {/* Everything but hospitals: grouped into numbered bubbles when zoomed out. */}
          <GeoJSONSource
            id="places"
            ref={others}
            data={rest}
            cluster
            clusterRadius={50}
            clusterMaxZoom={12}
            onPress={(e) => onPlacePress(e, others)}
            hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Layer
              id="places-clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': '#263238',
                'circle-opacity': 0.88,
                'circle-radius': ['step', ['get', 'point_count'], 15, 10, 18, 50, 22, 200, 27],
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
              }}
            />
            <Layer
              id="places-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['Noto Sans Bold'],
                'text-size': 13,
                'text-allow-overlap': true,
              }}
              paint={{ 'text-color': '#FFFFFF' }}
            />
            <Layer
              id="places-pins"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': byKind((k) => k.color, '#333333'),
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 12, 10, 15, 13],
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
              }}
            />
            <Layer
              id="places-letters"
              type="symbol"
              filter={['!', ['has', 'point_count']]}
              minzoom={10}
              layout={{
                'text-field': byKind((k) => k.letter, ''),
                'text-font': ['Noto Sans Bold'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 13],
                'text-allow-overlap': true,
                'text-ignore-placement': true,
              }}
              paint={{ 'text-color': '#FFFFFF' }}
            />
            <Layer
              id="places-names"
              type="symbol"
              filter={['!', ['has', 'point_count']]}
              minzoom={13.5}
              layout={{
                'text-field': ['get', 'name'],
                'text-font': ['Noto Sans Bold'],
                'text-size': 12,
                'text-anchor': 'top',
                'text-offset': [0, 1.2],
                'text-max-width': 9,
                'text-optional': true,
              }}
              paint={{ 'text-color': '#14231D', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 }}
            />
          </GeoJSONSource>

          {/* Hospitals are never grouped, and drawn biggest, so they're always easy to find. */}
          <GeoJSONSource
            id="hospitals"
            ref={hospitalSource}
            data={hospitals}
            cluster
            clusterRadius={36}
            clusterMaxZoom={8}
            onPress={(e) => onPlacePress(e, hospitalSource)}
            hitbox={{ top: 14, right: 14, bottom: 14, left: 14 }}
          >
            <Layer
              id="hospital-clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': kindOf('hospital')!.color,
                'circle-radius': ['step', ['get', 'point_count'], 14, 10, 17, 50, 21],
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2.5,
              }}
            />
            <Layer
              id="hospital-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['concat', 'H ', ['get', 'point_count_abbreviated']],
                'text-font': ['Noto Sans Bold'],
                'text-size': 12,
                'text-allow-overlap': true,
              }}
              paint={{ 'text-color': '#FFFFFF' }}
            />
            <Layer
              id="hospital-pins"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': kindOf('hospital')!.color,
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 9, 9, 12, 13, 15, 16],
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2.5,
              }}
            />
            <Layer
              id="hospital-letters"
              type="symbol"
              filter={['!', ['has', 'point_count']]}
              layout={{
                'text-field': 'H',
                'text-font': ['Noto Sans Bold'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 7, 9, 12, 13, 15, 16],
                'text-allow-overlap': true,
                'text-ignore-placement': true,
              }}
              paint={{ 'text-color': '#FFFFFF' }}
            />
            <Layer
              id="hospital-names"
              type="symbol"
              filter={['!', ['has', 'point_count']]}
              minzoom={11}
              layout={{
                'text-field': ['get', 'name'],
                'text-font': ['Noto Sans Bold'],
                'text-size': 13,
                'text-anchor': 'top',
                'text-offset': [0, 1.3],
                'text-max-width': 9,
                'text-optional': true,
              }}
              paint={{ 'text-color': '#8E1B1B', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 }}
            />
          </GeoJSONSource>

          {/* A ring around the place whose card is open. */}
          <GeoJSONSource id="picked" data={pickedFeature}>
            <Layer
              id="picked-ring"
              type="circle"
              paint={{
                'circle-color': 'rgba(0,0,0,0)',
                'circle-radius': 22,
                'circle-stroke-color': '#111111',
                'circle-stroke-width': 3,
              }}
            />
          </GeoJSONSource>

          {located && <UserLocation />}
        </Map>
        {!ready && (
          <View pointerEvents="none" style={[s.loading, { backgroundColor: t.bg }]}>
            <ActivityIndicator size="large" color={t.accent} />
            <Text style={{ color: t.text, fontSize: 16, marginTop: 10 }}>Loading the map…</Text>
          </View>
        )}
      </View>

      {/* A soft strip behind the clock so it stays readable over the map. */}
      <View
        pointerEvents="none"
        style={[s.statusStrip, { height: insets.top, backgroundColor: t.bg }]}
      />

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
        {picking ? (
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
                      style={{ color: on ? t.accentText : t.text, fontSize: 15, fontWeight: '700' }}
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
              {plan.streetLevel ? 'street-level detail' : 'main roads and towns (less detail)'}.
              Emergency places are already on your phone for the whole country.
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
        ) : picked && pickedKind ? (
          // ----- One place, picked on the map or from the quick row -----
          <>
            <View style={s.cardHead}>
              <View style={[s.pin, { backgroundColor: pickedKind.color }]}>
                <Text style={s.pinText}>{pickedKind.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 19, fontWeight: '800' }} numberOfLines={2}>
                  {picked.name || pickedKind.one}
                </Text>
                <Text style={{ color: t.muted, fontSize: 15 }}>{pickedKind.one}</Text>
              </View>
              <Pressable
                onPress={() => setPicked(null)}
                hitSlop={10}
                accessibilityLabel="Close"
                style={[s.close, { backgroundColor: t.soft }]}
              >
                <Ionicons name="close" size={20} color={t.text} />
              </Pressable>
            </View>
            <View style={[s.direction, { backgroundColor: t.soft }]}>
              <Ionicons name="navigate" size={22} color={t.accent} />
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '700', flex: 1 }}>
                {formatMiles(pickedMiles)} {directionTo(from, [picked.lon, picked.lat])}{' '}
                <Text style={{ color: t.muted, fontSize: 15, fontWeight: '400' }}>
                  {fromWords}, as the crow flies
                </Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                label="Show on map"
                kind="secondary"
                onPress={() => focus(picked, 16)}
                style={{ flex: 1 }}
              />
              <Button
                label="Next closest"
                onPress={() => {
                  const list = nearest(from, picked.kind, 6);
                  const at = list.findIndex((p) => p.id === picked.id);
                  const next = list[at + 1] ?? list[0];
                  if (next) focus(next, 14);
                }}
                style={{ flex: 1 }}
              />
            </View>
            <Text style={{ color: t.muted, fontSize: 13, lineHeight: 18 }}>
              From OpenStreetMap, so it may be out of date. Roads can be blocked: check the route
              before you go.
            </Text>
          </>
        ) : (
          <>
            {/* ----- Nearest hospital, shelter and water ----- */}
            <Text style={[s.title, { color: t.text }]}>Nearest {fromWords}</Text>
            <View style={s.quickRow}>
              {quick.map(({ kind, place }) => {
                const k = kindOf(kind)!;
                return (
                  <Pressable
                    key={kind}
                    disabled={!place}
                    onPress={() => place && focus(place, 14)}
                    style={({ pressed }) => [
                      s.quick,
                      { backgroundColor: t.soft, borderColor: k.color },
                      pressed && { opacity: 0.75 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      place
                        ? `Nearest ${k.one}: ${formatMiles(place.miles)} ${place.direction}`
                        : `No ${k.one} nearby`
                    }
                  >
                    <View style={[s.quickDot, { backgroundColor: k.color }]}>
                      <Text style={s.quickLetter}>{k.letter}</Text>
                    </View>
                    <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>
                      {k.short}
                    </Text>
                    <Text style={{ color: t.text, fontSize: 14 }} numberOfLines={1}>
                      {place ? `${formatMiles(place.miles)} ${shortDirection(place.direction)}` : 'None near'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ----- What to draw on the map ----- */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // Edge to edge, so chips scroll off the screen, not into the panel's padding.
              contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
              style={{ flexGrow: 0, marginHorizontal: -16 }}
            >
              {KINDS.map((k) => {
                const on = shown.includes(k.id);
                return (
                  <Pressable
                    key={k.id}
                    onPress={() => toggle(k.id)}
                    style={[s.chip, { backgroundColor: on ? k.color : t.soft, borderColor: k.color }]}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: on }}
                  >
                    <View style={[s.chipDot, { backgroundColor: on ? '#FFFFFF' : k.color }]} />
                    <Text style={{ color: on ? '#FFFFFF' : t.text, fontSize: 15, fontWeight: '700' }}>
                      {k.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ----- Offline maps ----- */}
            <View style={s.savedHead}>
              <Text style={[s.title, { color: t.text, flex: 1 }]}>Offline maps</Text>
              <Pressable
                onPress={() => {
                  setPicking(true);
                  // Zoom so the green box fills the screen instead of being a dot. Wait a
                  // moment for the panel to switch, or the camera ignores the request.
                  setTimeout(() => show(bounds), 150);
                }}
                style={[s.addBtn, { backgroundColor: t.accent }]}
                accessibilityRole="button"
              >
                <Ionicons name="add" size={18} color={t.accentText} />
                <Text style={{ color: t.accentText, fontSize: 15, fontWeight: '700' }}>
                  {saved.length ? 'Save another' : 'Save an area'}
                </Text>
              </Pressable>
            </View>
            {saved.length === 0 ? (
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
                Save the streets around home, family and your way out of town. The pins above
                already work offline.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 110 }}>
                {saved.map((a) => (
                  <View key={a.id} style={[s.savedRow, { borderBottomColor: t.border }]}>
                    <Pressable onPress={() => show(a.bounds)} style={s.savedMain}>
                      <Ionicons name="checkmark-circle" size={22} color={t.good} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>
                          {a.name}
                        </Text>
                        <Text style={{ color: t.muted, fontSize: 14 }}>
                          Saved{a.megabytes ? ` · about ${a.megabytes} MB` : ''} · tap to view
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable onPress={() => remove(a)} hitSlop={10} accessibilityLabel="Remove saved map">
                      <Ionicons name="trash-outline" size={20} color={t.muted} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
        <Text style={{ color: t.muted, fontSize: 12 }}>
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
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  statusStrip: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.82 },
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
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  title: { fontSize: 19, fontWeight: '800' },
  quickRow: { flexDirection: 'row', gap: 8 },
  quick: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  quickDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickLetter: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  savedHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  savedMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: { width: '48.5%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
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
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  direction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
