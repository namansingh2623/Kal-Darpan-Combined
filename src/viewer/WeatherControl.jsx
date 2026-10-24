import { useEffect, useState } from 'react';
import { CloudSun, LoaderCircle, MapPin, RefreshCw, Sparkles, Wind, X, CalendarDays } from 'lucide-react';

const REFRESH_INTERVAL = 15 * 60 * 1000;

function bestVisitDay(days) {
  if (!days?.length) return null;

  const scoredDays = days.map((day) => {
    const { high, low, rainChance } = day;
    const temperatureScore = high == null || low == null
      ? 0
      : Math.max(0, 100 - Math.abs((high + low) / 2 - 24) * 5 - Math.max(0, high - 30) * 4);
    return {
      ...day,
      score: temperatureScore - rainChance * 0.8,
    };
  });

  return scoredDays.reduce((best, day) => day.score > best.score ? day : best, scoredDays[0]);
}

function formatDate(date, language) {
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    .format(new Date(`${date}T12:00:00`));
}

export default function WeatherControl({ location, monument, t = (text) => text, language = 'en' }) {
  const [open, setOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    let interval;

    const loadWeather = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
        });
        const response = await fetch(`/api/weather?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Weather service returned ${response.status}.`);
        if (!data.current || !data.daily) throw new Error('The weather service returned incomplete data.');
        setWeather(data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Could not load live weather.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadWeather();
    interval = window.setInterval(loadWeather, REFRESH_INTERVAL);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [location.latitude, location.longitude, open, refreshKey]);

  const bestDay = weather ? bestVisitDay(weather.daily) : null;

  return (
    <div className="kd-weather-control">
      <button
        type="button"
        className="kd-weather-launcher"
        aria-expanded={open}
        aria-controls="kd-live-weather"
        onClick={() => setOpen((value) => !value)}
      >
        <CloudSun size={16} />
        <span>{t('Weather')}</span>
      </button>
      {open && (
        <section className="kd-weather-popover" id="kd-live-weather" aria-label={`${t('Live weather for')} ${t(location.city)}`}>
          <div className="kd-weather-heading">
            <div>
              <div className="flex items-center gap-2"><MapPin size={14} /><span>{location.city}</span></div>
              <div className="kd-weather-subheading">{t('Live local conditions')}</div>
            </div>
            <button
              type="button"
              className="kd-weather-icon-button"
              onClick={() => setRefreshKey((key) => key + 1)}
              aria-label={t('Refresh weather')}
              disabled={loading}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            </button>
            <button type="button" className="kd-weather-icon-button" onClick={() => setOpen(false)} aria-label={t('Close weather')}>
              <X size={16} />
            </button>
          </div>
          {loading && !weather && <p className="kd-weather-message" role="status">{t('Loading current conditions…')}</p>}
          {error && (
            <div className="kd-weather-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>{t('Try again')}</button>
            </div>
          )}
          {weather && (
            <>
              <div className="kd-weather-current">
                <CloudSun size={24} />
                <div>
                  <div className="kd-weather-temperature">{Math.round(weather.current.temperature)}°C</div>
                  <div className="kd-weather-condition">{t(weather.current.description)}</div>
                </div>
              </div>
              <div className="kd-weather-stats">
                <span>{t('Feels like')} <strong>{Math.round(weather.current.apparentTemperature)}°C</strong></span>
                <span><Wind size={13} /> <strong>{Math.round(weather.current.windSpeed)} m/s</strong></span>
                <span>{t('Humidity')} <strong>{weather.current.humidity}%</strong></span>
              </div>
              {bestDay && (
                <div className="kd-weather-recommendation">
                  <div className="kd-weather-recommendation-title"><Sparkles size={14} /> {t('Best upcoming visit')}</div>
                  <div className="kd-weather-recommendation-date">{formatDate(bestDay.date, language)}</div>
                  <div className="kd-weather-recommendation-detail">
                    {bestDay.low != null && bestDay.high != null && `${Math.round(bestDay.low)}–${Math.round(bestDay.high)}°C`}
                    {bestDay.low != null && bestDay.high != null && ' · '}
                    {bestDay.rainChance}% {t('chance of rain')}
                  </div>
                </div>
              )}
              <button type="button" className="kd-plan-visit-launcher" onClick={() => { const url = new URL('/plan-visit.html', window.location.origin); url.searchParams.set('monument', monument?.id || 'taj'); url.searchParams.set('language', language); window.open(url.toString(), '_blank', 'noopener,noreferrer'); }}><CalendarDays size={15} /> PLAN MY VISIT <span aria-hidden="true">↗</span></button>
              <div className="kd-weather-updated">
                Updated {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(weather.fetchedAt))}
                {' · '}
                <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
