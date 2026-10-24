export function poiSpeech(poi) {
  const facts = poi.facts?.length ? ` Key points: ${poi.facts.join('. ')}.` : '';
  return `${poi.title}. ${poi.description}${facts}`;
}

export const eventSpeech = (event) => event.narration ?? `${event.year}. ${event.label}. ${event.text}`;

export function laterHistorySpeech(monument) {
  const lastConstructionYear = monument.construction.years[monument.construction.years.length - 1][1];
  const lines = (monument.events || [])
    .filter((event) => Number(event.year) > lastConstructionYear)
    .map((event) => event.narration ?? `${event.year}: ${event.text}`);
  return lines.length ? `Later history. ${lines.join(' ')}` : '';
}

export function monumentInfoSpeech(monument) {
  const note = monument.construction.note ? ` ${monument.construction.note}` : '';
  return `${monument.title}. ${monument.description}${note} The 3D reconstruction is illustrative and not to scale.`;
}
