import { useEffect, useMemo, useRef, useState } from 'react';
import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { ArrowLeft, ArrowUpRight, Home, Info, Landmark, LocateFixed, MapPin, Moon, Sun } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './HeritageAtlas.css';
import { LanguageToggle } from './i18n.jsx';

setWorkerUrl(maplibreWorkerUrl);

const places = [
  { id: 'qutub', name: 'Qutub Minar', lat: 28.5245, lon: 77.1855, city: 'Mehrauli, Delhi', type: 'tower', description: 'A soaring tower of red sandstone and marble, built by successive Delhi sultans.' },
  { id: 'fort', name: 'Red Fort', lat: 28.6562, lon: 77.241, city: 'Old Delhi', type: 'fort', description: 'A monumental Mughal fort of red sandstone and grand courtyards.' },
  { id: 'taj', name: 'Taj Mahal', lat: 27.1751, lon: 78.0421, city: 'Agra, Uttar Pradesh', type: 'taj', description: 'An ivory-white marble mausoleum commissioned by Shah Jahan.' },
  { id: 'humayun', name: 'Humayun’s Tomb', lat: 28.5933, lon: 77.2507, city: 'Nizamuddin, Delhi', type: 'tomb', description: 'A garden tomb whose design helped shape later Mughal architecture.' },
  { id: 'india-gate', name: 'India Gate', lat: 28.6129, lon: 77.2295, city: 'Central Delhi', type: 'gate', description: 'A monumental war memorial along New Delhi’s ceremonial avenue.' },
  { id: 'purana-qila', name: 'Purana Qila', lat: 28.6094, lon: 77.2436, city: 'Mathura Road, Delhi', type: 'fort', description: 'A historic fort with massive gateways and layered history.' },
  { id: 'jantar-mantar', name: 'Jantar Mantar', lat: 28.6271, lon: 77.2166, city: 'Connaught Place, Delhi', type: 'observatory', description: 'An open-air observatory built to study the movement of the skies.' },
  { id: 'agrasen-baoli', name: 'Agrasen Ki Baoli', lat: 28.626, lon: 77.2263, city: 'Hailey Road, Delhi', type: 'stepwell', description: 'A striking stepwell descending through rhythmic stone arches.' },
  { id: 'safdarjung', name: 'Safdarjung Tomb', lat: 28.5868, lon: 77.21, city: 'New Delhi', type: 'tomb', description: 'A late Mughal garden tomb crowned by a graceful dome.' },
];

const supportedMonuments = new Set(['taj', 'qutub', 'fort', 'jantar-mantar', 'humayun']);
const defaultCenter = [78.7, 28.1];

function distanceKm(from, to) {
  const radians = Math.PI / 180;
  const latitude = (to.lat - from.lat) * radians;
  const longitude = (to.lon - from.lon) * radians;
  const a = Math.sin(latitude / 2) ** 2 +
    Math.cos(from.lat * radians) * Math.cos(to.lat * radians) * Math.sin(longitude / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function formatDistance(distance) {
  return distance < 10 ? `${distance.toFixed(1)} km` : `${Math.round(distance)} km`;
}

// Map-native GeoJSON layers position each monument in geographical space.
// No HTML marker/CSS transforms are involved in monument placement.
function monumentGeoJSON(translate) {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      properties: { id: place.id, name: translate(place.name) },
      geometry: { type: 'Point', coordinates: [place.lon, place.lat] },
    })),
  };
}

export default function HeritageAtlas({ theme, selectedMonumentId, onToggleTheme, onJourney, onAbout, onBack, onHome, onEnterHall, onExplore, language, setLanguage, t }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const translateRef = useRef(t);
  translateRef.current = t;
  const userMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState(selectedMonumentId || 'qutub');
  const selectedIdRef = useRef(selectedMonumentId || 'qutub');
  selectedIdRef.current = selectedId;
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Explore the collection or use your location to find nearby landmarks.');
  const [locating, setLocating] = useState(false);

  const nearbyPlaces = useMemo(() => {
    if (!userLocation) return places.map((place) => ({ ...place, distance: null }));
    return places
      .map((place) => ({ ...place, distance: distanceKm(userLocation, place) }))
      .filter((place) => place.distance <= 100)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation]);
  const selected = places.find((place) => place.id === selectedId) || places[0];

  useEffect(() => {
    if (!mapContainer.current) return undefined;
    const map = new MapLibreMap({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{
          id: 'osm-raster',
          type: 'raster',
          source: 'osm',
          paint: { 'raster-saturation': -0.42, 'raster-contrast': 0.08, 'raster-brightness-min': 0.06 },
        }],
      },
      center: defaultCenter,
      zoom: 5.2,
      pitch: 35,
      bearing: -8,
      maxPitch: 65,
      maxBounds: [[68, 6], [97.5, 37.5]],
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');
    const updatePadding = () => {
      map.setPadding({
        top: 0,
        right: 0,
        bottom: window.innerWidth <= 760 ? Math.round(window.innerHeight * 0.56) : 0,
        left: window.innerWidth <= 760 ? 0 : 420,
      });
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    map.on('load', () => {
      map.addSource('heritage-monuments', { type: 'geojson', data: monumentGeoJSON(translateRef.current) });
      map.addLayer({
        id: 'heritage-monument-dots',
        type: 'circle',
        source: 'heritage-monuments',
        paint: {
          'circle-radius': ['case', ['==', ['get', 'id'], selectedIdRef.current], 10, 7],
          'circle-color': ['case', ['==', ['get', 'id'], selectedIdRef.current], '#ea4335', '#e3b66b'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.5,
          'circle-opacity': 1,
        },
      });
      map.addLayer({
        id: 'heritage-monument-labels',
        type: 'symbol',
        source: 'heritage-monuments',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-offset': [0, -1.7],
          'text-anchor': 'bottom',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#171816',
          'text-halo-width': 2,
        },
      });
      map.on('click', 'heritage-monument-dots', (event) => {
        const id = event.features?.[0]?.properties?.id;
        const place = places.find((item) => item.id === id);
        if (!place) return;
        setSelectedId(id);
        map.flyTo({ center: [place.lon, place.lat], zoom: 14.5, pitch: 48, duration: 900 });
      });
      map.on('mouseenter', 'heritage-monument-dots', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'heritage-monument-dots', () => { map.getCanvas().style.cursor = ''; });
      setMapReady(true);
    });
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(mapContainer.current);
    return () => {
      window.removeEventListener('resize', updatePadding);
      resizeObserver.disconnect();
      userMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map?.getLayer('heritage-monument-dots')) return;
    const isSelected = ['==', ['get', 'id'], selectedId];
    map.setPaintProperty('heritage-monument-dots', 'circle-radius', ['case', isSelected, 10, 7]);
    map.setPaintProperty('heritage-monument-dots', 'circle-color', ['case', isSelected, '#ea4335', '#e3b66b']);
    const nearbyIds = userLocation
      ? places.filter((place) => distanceKm(userLocation, place) <= 100).map((place) => place.id)
      : [];
    const visibleIds = nearbyIds.length ? nearbyIds : places.map((place) => place.id);
    const visibilityFilter = ['in', ['get', 'id'], ['literal', visibleIds]];
    map.setFilter('heritage-monument-dots', visibilityFilter);
    map.setFilter('heritage-monument-labels', visibilityFilter);
  }, [mapReady, selectedId, userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (mapReady && map?.getSource('heritage-monuments')) {
      map.getSource('heritage-monuments').setData(monumentGeoJSON(t));
    }
  }, [mapReady, t]);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location services are not available in this browser.');
      return;
    }
    setLocating(true);
    setLocationStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { lat: coords.latitude, lon: coords.longitude };
        setUserLocation(location);
        setLocating(false);
        const nearby = places.filter((place) => distanceKm(location, place) <= 100);
        setLocationStatus(nearby.length
          ? `${nearby.length} landmark${nearby.length === 1 ? '' : 's'} within 100 km.`
          : 'No landmarks in this collection are within 100 km. Showing all landmarks on the map.');
        const map = mapRef.current;
        if (!map) return;
        userMarkerRef.current?.remove();
        const element = document.createElement('div');
        element.className = 'atlas-user-marker';
        element.setAttribute('aria-label', 'Your location');
        userMarkerRef.current = new Marker({ element, anchor: 'center', pitchAlignment: 'viewport', rotationAlignment: 'viewport' })
          .setLngLat([location.lon, location.lat])
          .addTo(map);
        if (!nearby.length) return;
        const bounds = new LngLatBounds([location.lon, location.lat], [location.lon, location.lat]);
        nearby.forEach((place) => bounds.extend([place.lon, place.lat]));
        const mobile = window.innerWidth <= 760;
        map.fitBounds(bounds, {
          padding: mobile
            ? { top: 60, right: 30, bottom: Math.round(window.innerHeight * 0.56) + 20, left: 30 }
            : { top: 90, right: 70, bottom: 90, left: 430 },
          maxZoom: 12,
          duration: 900,
        });
      },
      (error) => {
        setLocating(false);
        setLocationStatus(error.code === error.PERMISSION_DENIED
          ? 'Location access was denied. You can still explore all landmarks.'
          : 'Could not determine your location. Try again or explore all landmarks.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const focusPlace = (place) => {
    setSelectedId(place.id);
    mapRef.current?.flyTo({ center: [place.lon, place.lat], zoom: 14.5, pitch: 48, duration: 900 });
  };

  return (
    <main className="heritage-atlas" data-theme={theme} aria-label={t('Heritage Atlas of India')}>
      <div ref={mapContainer} className="atlas-map" aria-label={t('Interactive map of heritage landmarks')} />
      <aside className="atlas-panel">
        <header className="atlas-header">
          <button type="button" className="atlas-home" onClick={onHome} aria-label={t('Open the homepage')} title={t('Open the homepage')}><Home size={16}/></button>
          <button type="button" className="atlas-back" onClick={onBack}><ArrowLeft size={15}/> <span>{t('Back')}</span></button>
          <a className="atlas-brand" href="#home" onClick={(event) => event.preventDefault()}>
            <span className="atlas-brand-mark" aria-hidden="true">अ</span>
            <span>Kaal Darpan <small>{t('Heritage Atlas / India')}</small></span>
          </a>
          <div className="atlas-header-tools">
            <LanguageToggle language={language} onChange={setLanguage}/>
            <button type="button" className="atlas-close" onClick={onAbout} aria-label={t('About')}><Info size={17} /></button>
          </div>
        </header>
        <div className="atlas-content">
          <p className="atlas-eyebrow">{t('Landmarks · Culture · Place')}</p>
          <h1>{t('History, just around the corner.')}</h1>
          <p className="atlas-intro">{t('Explore historic monuments across North India. Find a landmark on the map, learn about its place, and open its interactive model.')}</p>
          <div className="atlas-actions">
            <button type="button" className="atlas-locate" onClick={locate} disabled={locating}>
              <LocateFixed size={16} /> {locating ? t('Finding you…') : t('Use my location')}
            </button>
            <button type="button" className="atlas-quiet-action atlas-hall-action" onClick={onEnterHall}>
              <Landmark size={15} /> <span>{t('Museum')}</span>
            </button>
            <button type="button" className="atlas-quiet-action" onClick={onJourney}>{t('My journey')}</button>
            <button type="button" className="atlas-quiet-action" onClick={onToggleTheme} aria-label={t(`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`)}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <p className="atlas-status" role="status">{t(locationStatus)}</p>
          <section className="atlas-nearby" aria-label={t('Heritage landmarks')}>
            <div className="atlas-list-heading">
              <h2>{t(userLocation && nearbyPlaces.length ? 'Nearby heritage' : 'Featured landmarks')}</h2>
              <span>{userLocation && nearbyPlaces.length ? `${nearbyPlaces.length} ${t('Nearby')}` : `${places.length} ${t('places')}`}</span>
            </div>
            <div className="atlas-list">
              {nearbyPlaces.length ? nearbyPlaces.map((place) => (
                <button
                  type="button"
                  key={place.id}
                  className={`atlas-place ${selectedId === place.id ? 'is-active' : ''}`}
                  onClick={() => focusPlace(place)}
                >
                  <span className={`atlas-place-icon atlas-place-${place.type}`} aria-hidden="true"><MapPin size={17} /></span>
                  <span className="atlas-place-copy">
                    <strong>{t(place.name)}</strong>
                    <small>{place.distance == null ? t(place.city) : `${formatDistance(place.distance)} · ${t(place.city)}`}</small>
                  </span>
                  <ArrowUpRight size={16} className="atlas-place-arrow" />
                </button>
              )) : (
                <div className="atlas-empty">
                  {t('No listed monuments are within 100 km. The full collection remains visible on the map.')}
                  <button type="button" onClick={() => setUserLocation(null)}>{t('Show all landmarks')}</button>
                </div>
              )}
            </div>
          </section>
          <section className="atlas-selected" aria-live="polite">
            <div className="atlas-selected-copy">
              <p className="atlas-eyebrow">{t('Selected landmark')}</p>
              <h2>{t(selected.name)}</h2>
              <p>{t(selected.description)}</p>
              <span><MapPin size={13} /> {t(selected.city)}</span>
            </div>
            {supportedMonuments.has(selected.id) && (
              <button type="button" className="atlas-explore" onClick={() => onExplore(selected.id)}>
                {t('Open monument')} <ArrowUpRight size={16} />
              </button>
            )}
          </section>
        </div>
        <footer className="atlas-footer">
          <span>{t('KAAL DARPAN · INDIAN HERITAGE')}</span>
          <button type="button" onClick={onAbout}>{t('About')}</button>
        </footer>
      </aside>
      <div className="atlas-map-badge"><span /> {t(mapReady ? 'NORTH INDIA · HERITAGE MAP' : 'LOADING HERITAGE MAP')}</div>
      <div className="atlas-map-legend">
        <span><i className="atlas-legend-monument" /> {t('Monument')}</span>
        {userLocation && <span><i className="atlas-legend-user" /> {t('Your location')}</span>}
        <button type="button" onClick={() => mapRef.current?.easeTo({ center: defaultCenter, zoom: 5.2, pitch: 35, bearing: -8, duration: 700 })}>{t('Reset map view')}</button>
      </div>
    </main>
  );
}
