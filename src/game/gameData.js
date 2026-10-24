// Hidden Lore Hotspots — content for the PLAY game.
// x / y are percentages of the 16:9 hall scene, so hotspots stay glued to the architecture at any screen size.
export const STORAGE_KEY = 'kaal-darpan-lore-v1';

export const halls = [
  {
    id: 'taj',
    name: 'Taj Mahal',
    place: 'Agra · 1632–1653',
    palette: { sky: ['#1a2233', '#0a0d16'], stone: '#d8d2c4', shade: '#8c8a8f', glow: '#bcd4ff', floor: '#12151d' },
    archive: {
      title: 'Archive I · The Marble Ledger',
      text: 'Work on the complex ran for roughly two decades, drawing craftspeople from across the Mughal world and beyond: stone-cutters, inlay artists, calligraphers and garden planners. Its harmony comes from strict geometry: a charbagh garden, a raised plinth, and a mausoleum framed by four minarets that were built to lean slightly outward.',
    },
    artifacts: [
      {
        id: 'taj-tile', kind: 'tile', x: 22, y: 68, name: 'Pietra Dura Floral Tile',
        text: 'Pietra dura is the art of cutting semi-precious stones (such as carnelian, jade, turquoise and lapis lazuli) into tiny pieces and setting them flush into marble. At the Taj Mahal it forms delicate flowering vines on the cenotaphs and the walls.',
      },
      {
        id: 'taj-brush', kind: 'brush', x: 74, y: 30, name: 'Mughal Paintbrush',
        text: 'Mughal miniature painters worked with extremely fine brushes, traditionally made from squirrel hair. The Taj’s great gateway carries Quranic calligraphy signed by Amanat Khan, one of the leading calligraphers of Shah Jahan’s court.',
      },
      {
        id: 'taj-sketch', kind: 'blueprint', x: 50, y: 80, name: 'Blueprint Sketch',
        text: 'Ustad Ahmad Lahori is traditionally credited as the chief architect, though historians debate how the design was shared among a council of master builders. Mughal plans were drawn as geometric layouts on paper, then marked out on the ground with cord and stakes.',
      },
    ],
  },
  {
    id: 'qutub',
    name: 'Qutub Minar',
    place: 'Delhi · from c. 1199',
    palette: { sky: ['#2b1d12', '#0d0905'], stone: '#c98a54', shade: '#7a4a2a', glow: '#ffd7a0', floor: '#150e08' },
    archive: {
      title: 'Archive II · The Tower of Victory',
      text: 'Begun under Qutb ud-Din Aibak around 1199 and carried higher by Iltutmish, the tower rises about 72.5 metres in five tapering storeys. Its fluted shaft is wrapped in bands of Arabic inscription, and later rulers repaired and raised its upper levels. It stands beside the Quwwat-ul-Islam mosque complex.',
    },
    artifacts: [
      {
        id: 'qutub-iron', kind: 'pillar', x: 23.5, y: 66, name: 'Iron Pillar Fragment',
        text: 'The Iron Pillar of Delhi in the mosque courtyard is roughly 7 metres tall and about 1,600 years old, dating to the Gupta era. It has resisted rust remarkably well, thanks to its phosphorus-rich iron and a thin protective layer that formed on its surface.',
      },
      {
        id: 'qutub-script', kind: 'script', x: 50, y: 46, name: 'Calligraphic Script Tile',
        text: 'Bands of Arabic inscription, including verses from the Quran, encircle the shaft of the Qutub Minar. Carved in red sandstone, they turn a defensive-looking tower into a page of text that can be read as you look upward.',
      },
      {
        id: 'qutub-rod', kind: 'rod', x: 82, y: 74, name: 'Ancient Measurement Rod',
        text: 'The tower tapers dramatically: its base is about 14 metres across, while the top storey is under 3 metres. Masons relied on measured rods and plumb lines to keep a shaft of about 72.5 metres and 379 steps true.',
      },
    ],
  },
  {
    id: 'fort',
    name: 'Red Fort',
    place: 'Delhi · 1638–1648',
    palette: { sky: ['#2a1114', '#0b0507'], stone: '#b5473f', shade: '#6a2523', glow: '#ffb9a8', floor: '#140808' },
    archive: {
      title: 'Archive III · The Fort of Shahjahanabad',
      text: 'Shah Jahan moved his capital to Delhi and raised the Lal Qila as the palace-fort of his new city, Shahjahanabad. Its red sandstone walls run for roughly 2.4 kilometres and enclose audience halls, pavilions and gardens linked by water channels. Today the fort is a UNESCO World Heritage Site.',
    },
    artifacts: [
      {
        id: 'fort-seal', kind: 'seal', x: 33, y: 60, name: 'Royal Seal Stamp',
        text: 'Imperial orders called farmans were authenticated with the emperor’s seal. A seal impression turned a sheet of paper into law, which is why the seal-engraver held a trusted place in the Mughal court.',
      },
      {
        id: 'fort-cannon', kind: 'cannon', x: 64, y: 78, name: 'Miniature Cannon',
        text: 'The Red Fort’s walls were built to be both a statement and a defence. Heavy sandstone ramparts, bastions and gates such as the Lahori Gate were planned with artillery in mind, long a feature of Mughal warfare.',
      },
      {
        id: 'fort-gem', kind: 'gem', x: 86, y: 40, name: 'Koh-i-Noor Folklore Fragment',
        text: 'Legend surrounds the Koh-i-Noor diamond. It is said to have been in the Mughal court at Delhi until Nader Shah of Persia sacked the city in 1739 and carried it off along with the Peacock Throne. Folklore adds that the stone brings misfortune to its male owners.',
      },
    ],
  },
];

export const chronicleLogs = [
  { title: 'Log I · Why Mughal builders loved symmetry', text: 'Symmetry in Mughal gardens and tombs was more than decoration. The charbagh, a garden divided into four parts by water channels, mirrored an idea of paradise described in Persian poetry, and it organised the whole Taj complex around a single central axis.' },
  { title: 'Log II · Reading a tower', text: 'The Qutub Minar can be read like a timeline. Its lower storeys are red sandstone, while later repairs introduced marble and different carving styles. Each change tells you which ruler stepped in and what the available stone and craft traditions were.' },
  { title: 'Log III · A city of red stone', text: 'Red sandstone was the signature material of Mughal imperial architecture in Delhi and Agra. At the Red Fort it was paired with white marble for the most important pavilions, so that the eye is guided from the rugged outer wall to the refined inner palace.' },
];

export const TOTAL = halls.reduce((n, h) => n + h.artifacts.length, 0);
