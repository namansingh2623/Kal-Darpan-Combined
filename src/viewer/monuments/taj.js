// Taj Mahal configuration. Copy this file to add a new monument.
// Phase `match` rules (all optional, ANDed):  tags[] / notTags[] (mesh.userData.hotspot|part),
// names[] (regex on mesh / ancestor names, for GLB files), y:[min,max) (mesh centre height).
// Parts that match no phase go to the first phase without a `match`, else the last phase.

const domeRule = { scale: [0.9, 1.1, 0.9] };

export default {
  id: 'taj',
  title: 'Taj Mahal',
  dynasty: 'Mughal Empire',
  patron: 'Shah Jahan',
  location: 'Agra, Uttar Pradesh',
  weather: { city: 'Agra', latitude: 27.1751, longitude: 78.0421 },
  era: 'Mughal architecture',
  yearsLabel: '1632 – 1653',
  description:
    'Commissioned by Emperor Shah Jahan in memory of his wife Mumtaz Mahal, the white-marble mausoleum stands on the right bank of the Yamuna in a Mughal garden of nearly 17 hectares. Construction began in 1632 and the mausoleum was finished in 1648; the mosque, guest house, main gateway and outer courtyard followed, completed in 1653. Ustad Ahmad Lahori was the chief architect.',
  source: 'https://whc.unesco.org/en/list/252/',

  // type: 'procedural' (uses ../models.js makeMonument) | 'glb' | 'obj'
  // e.g. { type:'glb', path:'/models/taj.glb', size:14 }  (size = longest side in scene units)
  model: { type: 'procedural', builder: 'taj' },

  construction: {
    playSeconds: 28,
    approximate: false,
    note: 'Sources document the start (1632), the tomb’s completion (1648) and the completion of the mosque, guest house, gateway and outer courtyard (1653). Dates for the stages in between are illustrative.',
    // [timeline position 0..1, year]
    years: [[0, 1632], [0.86, 1648], [1, 1653]],
    phases: [
      { id: 'plinth', label: 'Plinth & foundations', from: 0, to: 0.16, style: 'rise', yearLabel: '1632–35',
        description: 'Workers prepare the riverside ground and raise the great square marble plinth.',
        match: { y: [0, 0.6], notTags: ['garden'] } },
      { id: 'body', label: 'Mausoleum body', from: 0.14, to: 0.5, style: 'rise', yearLabel: '1635–41',
        description: 'The square main chamber and its tall arched portals rise above the plinth.',
        match: { y: [0.6, 3.0], notTags: ['garden', 'minaret', 'dome'] } },
      { id: 'domes', label: 'Dome & chhatris', from: 0.46, to: 0.68, style: 'scale', yearLabel: '1641–45',
        description: 'The central dome, its drum, the four small domed chhatris and the finial crown the building.',
        match: { y: [3.0, 10], notTags: ['minaret', 'garden'] } },
      { id: 'minarets', label: 'Four minarets', from: 0.64, to: 0.86, style: 'rise', yearLabel: '1644–48',
        description: 'Four minarets are raised at the corners of the plinth, framing the tomb.',
        match: { tags: ['minaret'] } },
      { id: 'garden', label: 'Garden, gateway & mosques', from: 0.8, to: 1, style: 'fade', yearLabel: '1648–53',
        description: 'The charbagh garden, water channel, red sandstone mosque and guest house, and the great southern gate complete the setting; the whole complex is finished by 1653.',
        match: { tags: ['garden'] } },
    ],
  },

  explode: {
    center: [0, 0, 0],
    factor: 1,
    default: { scale: [0.35, 1, 0.35] },
    rules: {
      dome: domeRule,
      domes: domeRule,
      minaret: { scale: [0.9, 0, 0.9], offset: [0, 1.4, 0] },
      garden: { scale: [0.4, 0, 1], offset: [0, -0.2, 0] },
      plinth: { scale: [0, 0, 0] },
    },
  },

  camera: {
    position: [13, 9, 17],
    target: [0, 2, 2],
    minDistance: 6,
    maxDistance: 42,
    presets: {
      front: { position: [0, 4.5, 25], target: [0, 2.5, 1] },
      top: { position: [0.01, 30, 2], target: [0, 0, 2] },
      iso: { position: [14, 11, 16], target: [0, 2, 2] },
      details: { position: [4.5, 6.2, 7.2], target: [0, 4.2, 0] },
    },
  },

  pois: [
    { id: 'dome', title: 'The central dome', kicker: 'Form & crown', position: [0, 5.0, 0], anchor: [0, 3.8, 0], part: 'dome', appearsAt: 0.68,
      description: 'The onion-shaped marble dome sits on a cylindrical drum and is topped by a lotus-shaped base carrying a metal finial. Four smaller domed chhatris surround it, so the eye is led upward to one central form. This scale model simplifies the real proportions.',
      facts: ['Double-shelled dome', 'Lotus-petal base', 'Four chhatris'],
      image: '/images/poi/taj-dome.jpg', imageAlt: 'The Taj Mahal central dome and finial above the garden',
      imageCredit: 'Dhirad (edited by J. A. Knudsen)', imageLicense: 'CC BY-SA 3.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Taj_Mahal_in_March_2004.jpg' },
    { id: 'minaret', title: 'Four minarets', kicker: 'Framing the tomb', position: [3.7, 4.4, 3.7], part: 'minaret', appearsAt: 0.86,
      description: 'A slender minaret stands at each corner of the plinth. They frame the mausoleum and balance the composition from every side; orbit the model and compare their positions. UNESCO notes that these free-standing minarets gave Mughal architecture a new dimension, giving the monument a spatial reference and a three-dimensional effect.',
      facts: ['Four corners', 'Three balconies each (model)', 'Free-standing, at the platform corners'],
      image: '/images/poi/taj-minaret.jpg', imageAlt: 'One of the Taj Mahal minarets in morning light',
      imageCredit: 'Sandip Dey', imageLicense: 'CC BY 3.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:One_of_the_four_minarets_of_Taj_Mahal.jpg' },
    { id: 'iwan', title: 'Arched portals', kicker: 'Entrances', position: [0, 1.7, 2.8], part: null, phase: 'body', appearsAt: 0.5,
      description: 'Tall pointed-arch portals (iwans) are recessed into each face of the mausoleum. Real portals are framed with calligraphy and inlay. In this model they appear as dark arched openings that show the idea of a symmetrical, repeated entrance.',
      facts: ['Repeated on each face', 'Symmetry'],
      image: '/images/poi/taj-portal.jpg', imageAlt: 'The decorated southern arched portal of the Taj Mahal',
      imageCredit: 'Biswarup Ganguly', imageLicense: 'CC BY 3.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Southern_Portal_-_Taj_Mahal_-_Agra_2014-05-14_3793.JPG' },
    { id: 'garden', title: 'Charbagh garden', kicker: 'Paradise garden', position: [0, 0.6, 7], part: 'garden', appearsAt: 1,
      description: 'The garden follows the Persian charbagh plan: a space divided into four quarters by water channels and paths. The long central channel mirrors the mausoleum and strengthens the sense of order and symmetry.',
      facts: ['Four-part layout', 'Central water channel'],
      image: '/images/poi/taj-garden.jpg', imageAlt: 'The Taj Mahal framed by its charbagh garden and central water channel',
      imageCredit: 'Vyacheslav Argenberg', imageLicense: 'CC BY 4.0',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Taj_Mahal_and_Persian_gardens,_Agra,_India.jpg' },
  ],
  events: [
    { year: 1648, label: 'Mausoleum complete', text: 'The tomb itself is finished; work on the rest of the complex continues.' },
    { year: 1653, label: 'Complex complete', text: 'The mosque, jawab, main gateway and outer courtyard are finished.' },
    { year: 1666, label: 'Shah Jahan interred', text: 'Shah Jahan dies and is buried in the Taj Mahal beside Mumtaz Mahal.' },
    { year: 1908, label: 'Restoration completed', text: 'A major conservation programme, begun under Lord Curzon, is completed.' },
    { year: 1983, label: 'UNESCO listing', text: 'The Taj Mahal is inscribed on the UNESCO World Heritage List.' },
  ],
};
