import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CloudRain, Download, MapPin, Thermometer, CheckCircle2, AlertTriangle, Home, Landmark, Clock3 } from 'lucide-react';
import { getMonument } from './viewer/monumentsData';
import './plan-visit.css';

// Tune these thresholds to match your preferred travel comfort/safety policy.
const TEMP_TOO_LOW_C = 10;
const TEMP_TOO_HIGH_C = 35;
const HIGH_RAIN_CHANCE_PERCENT = 60;

function localDateString(date = new Date()) {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function readableDate(value) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export default function PlanVisit() {
  const params = new URLSearchParams(window.location.search);
  const monument = getMonument(params.get('monument')) || getMonument('taj');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const { latitude, longitude } = monument.weather;
        const response = await fetch(`/api/weather?${new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) })}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load the forecast.');
        setWeather(data);
      } catch (e) { if (!controller.signal.aborted) setError(e.message || 'Could not load weather.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [monument]);

  const forecast = useMemo(() => {
    if (!weather?.daily?.length) return null;
    const today = localDateString();
    return weather.daily.find((day) => day.date > today) || weather.daily[1] || weather.daily[0];
  }, [weather]);

  const plan = useMemo(() => {
    if (!forecast) return null;
    const reasons = [];
    if (forecast.low < TEMP_TOO_LOW_C) reasons.push(`Low temperature (${Math.round(forecast.low)}°C) is below ${TEMP_TOO_LOW_C}°C.`);
    if (forecast.high > TEMP_TOO_HIGH_C) reasons.push(`High temperature (${Math.round(forecast.high)}°C) exceeds ${TEMP_TOO_HIGH_C}°C.`);
    if (forecast.rainChance >= HIGH_RAIN_CHANCE_PERCENT) reasons.push(`Rain probability (${forecast.rainChance}%) is high (threshold ${HIGH_RAIN_CHANCE_PERCENT}%).`);
    const recommended = reasons.length === 0;
    const pois = monument.pois || [];
    const itinerary = [
      { time: '8:00 AM', title: 'Arrival & entry', detail: `Arrive at ${monument.title}; allow time for tickets and security.` },
      { time: '9:00 AM', title: 'Main landmark', detail: pois[0] ? `Explore ${pois[0].title}.` : `Explore the main features of ${monument.title}.` },
      { time: '10:00 AM', title: 'Architecture & details', detail: pois[1] ? `Continue to ${pois[1].title}.` : 'Take time to notice the architecture and historical details.' },
      { time: '11:00 AM', title: 'Gardens / surrounding features', detail: pois[2] ? `Visit ${pois[2].title}.` : 'Explore the surrounding grounds where accessible.' },
      { time: '12:00 PM', title: 'Break & departure', detail: 'Take a rest, hydrate, and leave enough time for your return journey.' },
    ];
    const essentials = ['Entry ticket and valid ID', 'Drinking water', 'Charged phone and power bank', 'Comfortable walking shoes', 'Small first-aid supplies', 'Check opening hours and local entry rules'];
    if (forecast.low < TEMP_TOO_LOW_C) essentials.push('Warm layers, scarf, and covered footwear');
    if (forecast.high > TEMP_TOO_HIGH_C) essentials.push('Hat, sunscreen, sunglasses, and extra water; schedule outdoor stops early');
    if (forecast.rainChance >= HIGH_RAIN_CHANCE_PERCENT) essentials.push('Umbrella or raincoat, waterproof footwear, and a waterproof phone pouch');
    return { recommended, reasons, itinerary, essentials };
  }, [forecast, monument]);

  const report = useMemo(() => plan && ({
    title: `Plan My Visit — ${monument.title}`, destination: monument.title, location: monument.location,
    date: forecast.date, weather: { temperature: forecast.temperature, low: forecast.low, high: forecast.high, rainChance: forecast.rainChance, description: forecast.description },
    recommended: plan.recommended, recommendation: plan.recommended ? 'Recommended to visit' : 'Not recommended to visit', reasons: plan.reasons,
    itinerary: plan.itinerary, essentials: plan.essentials, generatedAt: new Date().toISOString(),
  }), [plan, monument, forecast]);

  useEffect(() => {
    if (!report) return;
    try { localStorage.setItem(`kaaldarpan-visit-plan-${monument.id}`, JSON.stringify(report)); setSaved(true); } catch { setSaved(false); }
  }, [report, monument.id]);

  async function downloadPdf() {
    if (!report) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 15;

      const paintBackground = () => {
        pdf.setFillColor(16, 21, 29);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      };
      const addPage = () => {
        pdf.addPage();
        paintBackground();
        y = 16;
      };
      const ensureSpace = (height) => {
        if (y + height > pageHeight - 14) addPage();
      };
      const sectionTitle = (title) => {
        ensureSpace(13);
        pdf.setTextColor(216, 192, 240);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(title.toUpperCase(), margin, y + 4);
        y += 9;
      };
      const card = (x, top, width, height, fill = [23, 31, 43], stroke = [52, 65, 83]) => {
        pdf.setFillColor(...fill);
        pdf.setDrawColor(...stroke);
        pdf.roundedRect(x, top, width, height, 3, 3, 'FD');
      };
      const wrappedText = (text, x, top, width, size = 8, color = [192, 202, 216]) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(String(text), width);
        pdf.text(lines, x, top);
        return lines.length * (size * 0.42);
      };
      const addFooter = () => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(127, 141, 160);
        pdf.text('Weather is a planning aid, not an official safety alert.', margin, pageHeight - 7);
      };

      paintBackground();
      pdf.setTextColor(200, 166, 223);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('KAAL DARPAN  /  VISIT PLANNER', margin, y);
      y += 11;
      pdf.setTextColor(245, 242, 248);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(23);
      pdf.text('Plan My Visit', margin, y);
      y += 8;
      pdf.setTextColor(170, 181, 197);
      pdf.setFontSize(9);
      pdf.text(`${report.destination}  |  ${readableDate(report.date)}`, margin, y);
      y += 6;

      card(margin, y, contentWidth, 20);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(242, 244, 248);
      pdf.text(report.destination, margin + 5, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(179, 192, 208);
      pdf.text(report.location, margin + 5, y + 14);
      pdf.setTextColor(158, 171, 192);
      pdf.text('FORECAST FOR', pageWidth - margin - 47, y + 7);
      pdf.setTextColor(242, 244, 248);
      pdf.setFontSize(6.5);
      pdf.text(pdf.splitTextToSize(readableDate(report.date), 44).slice(0, 2), pageWidth - margin - 47, y + 12);
      y += 26;

      sectionTitle('The weather');
      const weatherGap = 3;
      const weatherCardWidth = (contentWidth - weatherGap * 2) / 3;
      const weatherItems = [
        ['AROUND MIDDAY', `${Math.round(report.weather.temperature)}°C`, 'Tomorrow, local time'],
        ['RAIN PROBABILITY', `${report.weather.rainChance}%`, 'Forecast probability'],
        ['FORECAST', report.weather.description, 'Conditions may change'],
      ];
      weatherItems.forEach(([label, value, note], index) => {
        const x = margin + index * (weatherCardWidth + weatherGap);
        card(x, y, weatherCardWidth, 29, [32, 43, 58], [52, 66, 84]);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(179, 191, 208);
        pdf.text(label, x + 4, y + 7);
        pdf.setFontSize(index === 2 ? 9 : 15);
        pdf.setTextColor(242, 244, 248);
        const valueLines = pdf.splitTextToSize(String(value), weatherCardWidth - 8);
        pdf.text(valueLines.slice(0, 2), x + 4, y + 15);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(143, 157, 176);
        pdf.text(note, x + 4, y + 25);
      });
      y += 35;

      sectionTitle('Visit recommendation');
      const recommendationLines = pdf.splitTextToSize(
        report.recommended
          ? 'Recommended to visit. The forecast is within the configured temperature and rainfall limits. Check conditions again before departure.'
          : `Not recommended to visit. ${report.reasons.join(' ')}`,
        contentWidth - 12,
      );
      const recommendationHeight = Math.max(22, recommendationLines.length * 4.2 + 10);
      ensureSpace(recommendationHeight + 7);
      card(margin, y, contentWidth, recommendationHeight, report.recommended ? [25, 64, 54] : [78, 51, 30], report.recommended ? [62, 130, 109] : [180, 119, 67]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(242, 244, 248);
      pdf.text(report.recommendation, margin + 5, y + 7);
      wrappedText(recommendationLines.join(' '), margin + 5, y + 13, contentWidth - 10, 7);
      y += recommendationHeight + 6;

      sectionTitle('Itinerary');
      report.itinerary.forEach((item, index) => {
        const detailLines = pdf.splitTextToSize(item.detail, contentWidth - 45);
        const itemHeight = Math.max(13, detailLines.length * 3.7 + 7);
        ensureSpace(itemHeight + 2);
        card(margin, y, contentWidth, itemHeight, [23, 31, 43], [52, 65, 83]);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(203, 176, 228);
        pdf.text(`${index + 1}. ${item.time}`, margin + 4, y + 6);
        pdf.setTextColor(242, 244, 248);
        pdf.text(item.title, margin + 32, y + 6);
        wrappedText(detailLines.join(' '), margin + 32, y + 10, contentWidth - 37, 7);
        y += itemHeight + 2;
      });
      y += 2;
      sectionTitle('Essentials');
      const essentialGap = 3;
      const essentialWidth = (contentWidth - essentialGap) / 2;
      report.essentials.forEach((item, index) => {
        const column = index % 2;
        const x = margin + column * (essentialWidth + essentialGap);
        if (column === 0) {
          const nextItem = report.essentials[index + 1];
          const firstLines = pdf.splitTextToSize(item, essentialWidth - 10);
          const secondLines = nextItem ? pdf.splitTextToSize(nextItem, essentialWidth - 10) : [];
          const height = Math.max(firstLines.length, secondLines.length) * 3.8 + 7;
          ensureSpace(height + 2);
          card(margin, y, contentWidth, height, [23, 31, 43], [52, 65, 83]);
          wrappedText(`+ ${item}`, x + 4, y + 5, essentialWidth - 10, 7);
          if (nextItem) wrappedText(`+ ${nextItem}`, margin + essentialWidth + essentialGap + 4, y + 5, essentialWidth - 10, 7);
          y += height + 2;
        }
      });
      addFooter();
      pdf.save(`${monument.id}-visit-plan-${report.date}.pdf`);
    } catch (downloadFailure) {
      console.error('Unable to generate the visit-plan PDF.', downloadFailure);
      setDownloadError('The PDF could not be generated. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return <main className="plan-page">
    <header className="plan-header"><nav className="plan-navigation" aria-label="Visit planner navigation"><a className="plan-nav-link plan-home-link" href="/" aria-label="Go to homepage" title="Homepage"><Home size={17}/></a><a className="plan-nav-link" href="/?page=hall"><Landmark size={16}/> Back to museum</a><a className="plan-nav-link" href={`/?page=timeline&monument=${encodeURIComponent(monument.id)}`}><Clock3 size={16}/> Back to timeline</a><a className="plan-nav-link" href="/kaal-darpan-pricing/index.html">Pricing and billing</a></nav><div className="plan-eyebrow"><CalendarDays size={15}/> KAAL DARPAN · VISIT PLANNER</div><h1>Plan My Visit</h1><p>Weather-aware planning for {monument.title}</p></header>
    <div className="plan-content">
      <section className="plan-destination"><div><span className="plan-label">DESTINATION</span><h2>{monument.title}</h2><p><MapPin size={14}/>{monument.location}</p></div><div className="plan-date"><span>FORECAST FOR</span><strong>{forecast ? readableDate(forecast.date) : 'Tomorrow'}</strong></div></section>
      {loading && <p className="plan-status">Loading the next-day forecast…</p>}
      {error && <div className="plan-error" role="alert"><AlertTriangle size={18}/><div><strong>Weather unavailable</strong><p>{error}</p><p>The visit recommendation cannot be calculated until forecast data is available.</p></div></div>}
      {forecast && plan && <>
        <section className="plan-section"><div className="plan-section-title"><CloudRain size={19}/><h2>THE WEATHER</h2></div><div className="plan-weather-grid"><article className="plan-weather-card"><Thermometer size={20}/><span>Temperature around midday</span><strong>{Math.round(forecast.temperature)}°C</strong><small>Tomorrow's forecast, local time</small></article><article className="plan-weather-card"><CloudRain size={20}/><span>Rain probability</span><strong>{forecast.rainChance}%</strong><small>High-rain threshold: {HIGH_RAIN_CHANCE_PERCENT}%</small></article><article className="plan-weather-card"><CloudRain size={20}/><span>Forecast</span><strong className="plan-description">{forecast.description}</strong><small>Forecast may change; check again before travel.</small></article></div></section>
        <section className={`plan-recommendation ${plan.recommended ? 'is-recommended' : 'is-caution'}`}><div className="plan-recommendation-icon">{plan.recommended ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}</div><div><span className="plan-label">VISIT RECOMMENDATION</span><h2>{plan.recommended ? 'Recommended to visit' : 'NOT RECOMMENDED TO VISIT'}</h2><p>{plan.recommended ? 'The forecast is within the configured temperature and rainfall limits. Conditions can change, so check again before departure.' : 'One or more weather parameters are outside the preferred limits. Consider postponing. If you still choose to visit, use the itinerary and precautions below.'}</p>{plan.reasons.length > 0 && <ul>{plan.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}</div></section>
        <section className="plan-section"><div className="plan-section-title"><CalendarDays size={19}/><h2>ITINERARY</h2></div><div className="plan-itinerary">{plan.itinerary.map((item, index) => <article className="plan-stop" key={item.time}><div className="plan-stop-time">{item.time}</div><div className="plan-stop-marker">{index + 1}</div><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div>{!plan.recommended && <p className="plan-caution-note">For unfavorable weather, shorten outdoor stops, seek sheltered areas, and cancel if official alerts or site closures make travel unsafe.</p>}</section>
        <section className="plan-section"><div className="plan-section-title"><CheckCircle2 size={19}/><h2>ESSENTIALS</h2></div><ul className="plan-essentials">{plan.essentials.map((item) => <li key={item}><CheckCircle2 size={16}/>{item}</li>)}</ul></section>
        <div className="plan-actions"><button type="button" className="plan-download" onClick={downloadPdf} disabled={downloading}><Download size={17}/> {downloading ? 'Preparing PDF…' : 'Download visit plan (PDF)'}</button><span>{saved ? 'Plan also saved in this browser on this device.' : 'Browser storage unavailable; PDF download is still available.'}</span></div>{downloadError && <p className="plan-download-error" role="alert">{downloadError}</p>}
      </>}
      <footer className="plan-footer">Weather data is provided by the existing OpenWeather integration. This is a planning aid, not an official safety alert.</footer>
    </div>
  </main>;
}
