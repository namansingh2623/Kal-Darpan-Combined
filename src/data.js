// Museum content. `viewerId` links each monument to its timeline entry in ./viewer/monumentsData.js.
// Hotspots drive the museum model page; the timeline viewer has its own POIs in ./viewer/monuments/.
import { learningPhotos } from './learningPhotos.js';

export const monuments = [
  {
    id:'taj',
    viewerId:'taj',
    name:'Taj Mahal',
    learningImage:learningPhotos.taj,
    location:'Agra, Uttar Pradesh',
    era:'Mughal architecture',
    period:'1632–1653',
    source:'https://whc.unesco.org/en/list/252/',
    summary:'Commissioned by Shah Jahan in memory of Mumtaz Mahal, this white-marble mausoleum stands in Agra beside the Yamuna.',
    hotspots:[
      {id:'dome', title:'The central dome', position:[0,5.5,0], text:'A large dome crowns the mausoleum. Notice how the smaller domed pavilions balance the central form. The model simplifies the building’s proportions.'},
      {id:'minaret', title:'Four minarets', position:[3.7,3.8,3.7], text:'Four minarets stand at the corners of the raised platform. Orbit the model and compare their placement around the central mausoleum.'},
      {id:'garden', title:'Garden and symmetry', position:[-2,0.35,7], text:'The formal garden uses intersecting paths and water features. Compare the left and right sides to see the role of symmetry in the overall design.'}
    ],
    timeline:[
      ['1632','Construction began under Shah Jahan.'],
      ['1648','The mausoleum was completed.'],
      ['1653','The mosque, guest house, main gateway and outer courtyard were finished, completing the complex.'],
      ['1983','Inscribed on the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Who commissioned the Taj Mahal?', options:['Shah Jahan','Ashoka','Akbar'], answer:0, why:'Shah Jahan commissioned it in memory of Mumtaz Mahal.'},
      {question:'Where are the four minarets positioned?', options:['Inside the dome','At the corners of the platform','In the centre of the garden'], answer:1, why:'The minarets frame the mausoleum at the platform’s corners.'},
      {question:'Which river flows behind the Taj Mahal?', options:['Yamuna','Ganga','Narmada'], answer:0, why:'The tomb stands on the bank of the Yamuna at Agra.'},
      {question:'What is the four-part garden plan of the Taj complex called?', options:['Stepwell','Courtyard maze','Charbagh'], answer:2, why:'The charbagh divides the garden into four quarters with water channels and paths.'},
      {question:'When was the mausoleum itself completed?', options:['1632','1648','1707'], answer:1, why:'The mausoleum was finished in 1648; the rest of the complex followed by 1653.'},
      {question:'Which red sandstone building stands on the west side of the tomb?', options:['A palace','A mosque','A lighthouse'], answer:1, why:'A mosque stands to the west, balanced by the identical jawab on the east.'}
    ],
    additionalInfo:{
      intro:'The Taj Mahal is more than a white marble monument. Explore its layered construction, stone inlay, optical design and riverside garden.',
      sections:[
        {title:'Makrana marble over a structural core',body:'The main mausoleum is clad in white Makrana marble from Rajasthan. Its polished surface reflects light differently as conditions change. The building is not solid marble: much of its structural core is brick and lime mortar beneath the marble exterior.',image:learningPhotos.tajInlay},
        {title:'Parchin Kari: flowers made of stone',body:'Parchin Kari sets small pieces of coloured stone into marble to form intricate patterns. Lapis lazuli, carnelian, jade and jasper are among the stones used. The floral designs are not painted: they are assembled from carefully fitted stone pieces.'},
        {title:'Marble jali and the cenotaphs',body:'Finely carved marble lattice screens, or jali, surround the cenotaphs of Shah Jahan and Mumtaz Mahal in the main chamber. The screens filter light into geometric patterns. The actual graves lie in a lower chamber beneath the cenotaphs visitors see.'},
        {title:'Calligraphy designed for its viewpoint',body:'Quranic inscriptions are formed with dark stone inlaid into white marble. The letters grow larger higher up the arches, helping the lettering appear more uniform to visitors viewing it from the ground.'},
        {title:'Four minarets frame the mausoleum',body:'The four minarets stand at the corners of the main platform and strengthen the composition’s symmetry. A popular theory says they lean slightly outward so they would fall away from the tomb in an earthquake; the source notes that this explanation is not definitively established as the original design intention.'},
        {title:'A riverside charbagh',body:'Unlike many garden tombs, the mausoleum stands at the northern end of its charbagh, beside the Yamuna, rather than in the garden’s centre. Long paths and a reflecting pool draw the eye toward the tomb and shape the approach.'},
        {title:'Foundations beside the Yamuna',body:'Building beside the river raised questions of ground stability. Historical and engineering studies describe a foundation system incorporating wells and masonry elements to support the structure.'},
        {title:'White marble beside red sandstone',body:'The central mausoleum is clad in white marble, while the neighbouring mosque and guesthouse are primarily red sandstone. The contrast draws attention to the tomb and creates a clear visual hierarchy across the complex.'}
      ],
      didYouKnow:[
        'The marble came from Makrana, Rajasthan.',
        'The visible cenotaphs are not the actual graves.',
        'The floral decoration combines carving with coloured-stone inlay.',
        'The garden design makes use of the monument’s riverside setting.'
      ],
      sources:[
        {label:'UNESCO World Heritage Centre',url:'https://whc.unesco.org/en/list/252/'},
        {label:'Official Taj Mahal website',url:'https://tajmahal.gov.in/'},
        {label:'International Union of Geological Sciences — Makrana marble',url:'https://iugs-geoheritage.org/geoheritage_stones/makrana-marble/'}
      ]
    }
  },
  {
    id:'qutub',
    viewerId:'qutub',
    name:'Qutub Minar',
    learningImage:learningPhotos.qutub,
    location:'Delhi',
    era:'Delhi Sultanate',
    period:'c. 1199 – 1368',
    source:'https://whc.unesco.org/en/list/233/',
    summary:'The Qutb complex contains a tall tapering minaret and monuments from the early Delhi Sultanate.',
    hotspots:[
      {id:'tower', title:'A tapering tower', position:[0.8,6,0], text:'The tower narrows as it rises. Move around the model to examine its vertical form.'},
      {id:'balcony', title:'Projecting balconies', position:[1.15,3.5,0], text:'Balconies mark the storeys. They divide the tall structure into distinct visual sections.'},
      {id:'base', title:'The surrounding complex', position:[-2,0.4,2], text:'The minaret belongs to a larger historic complex. This first model shows only a simplified tower and platform.'}
    ],
    timeline:[
      ['c. 1199','Qutb ud-Din Aibak began the tower and completed its first storey.'],
      ['1211–1236','Iltutmish added the second, third and fourth storeys.'],
      ['1326 & 1368','Lightning damaged the fourth storey. Firuz Shah Tughlaq replaced it with two storeys, giving the tower five storeys and a height of 72.5 m.'],
      ['1993','The Qutb complex entered the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Which city contains the Qutb complex?', options:['Agra','Jaipur','Delhi'], answer:2, why:'The Qutb complex is in Delhi.'},
      {question:'How does the tower’s width change upward?', options:['It narrows','It gets wider','It stays square'], answer:0, why:'The minaret tapers as it rises.'},
      {question:'Who began building the tower around 1199?', options:['Akbar','Shah Jahan','Qutb ud-Din Aibak'], answer:2, why:'Qutb ud-Din Aibak began the tower and completed only its first storey.'},
      {question:'How many storeys does the tower have today?', options:['Three','Five','Seven'], answer:1, why:'Firuz Shah Tughlaq replaced the damaged fourth storey with two, giving five.'},
      {question:'Who replaced the lightning-damaged fourth storey with two new ones?', options:['Firuz Shah Tughlaq','Iltutmish','Shah Jahan'], answer:0, why:'Firuz Shah Tughlaq rebuilt the upper storeys after the 1368 lightning damage.'},
      {question:'Which ancient metal monument stands in the courtyard of the neighbouring mosque?', options:['A bronze bell','The Iron Pillar','A copper dome'], answer:1, why:'The Iron Pillar, carrying a fourth-century inscription, stands in the Quwwat-ul-Islam courtyard.'}
    ],
    additionalInfo:{
      intro:'Look beyond the tower to discover the materials, makers and monuments that tell the wider story of the Qutb complex.',
      sections:[
        {title:'A tower built across generations',body:'Construction began under Qutb-ud-din Aibak around 1199. His successor Iltutmish added further storeys, and later rulers repaired and restored the minaret. Its five storeys record the work of several generations of builders.'},
        {title:'Red and buff sandstone',body:'The tower is built mainly from red and buff sandstone. Alternating rounded and angular flutings catch sunlight differently, giving the surface a changing pattern of light and shadow.',image:learningPhotos.qutubSandstone},
        {title:'Balconies mark the height',body:'The minaret rises about 72.5 metres and has five storeys, each marked by a projecting balcony. Carved stone brackets support the balconies, creating strong horizontal bands without interrupting the tower’s vertical form.'},
        {title:'An older Iron Pillar',body:'The nearby Iron Pillar dates to the Gupta period, centuries before the minaret. Its Sanskrit inscription refers to a ruler named Chandra, commonly associated with Chandragupta II. The pillar is renowned for its resistance to corrosion and the ironworking skill it demonstrates.'},
        {title:'An unfinished ambition',body:'Alauddin Khalji began Alai Minar intending to build a tower much taller than Qutub Minar. Only its first massive storey was completed; the unfinished structure remains within the complex.'},
        {title:'Alai Darwaza and the wider complex',body:'Built in 1311, Alai Darwaza combines red sandstone, marble decoration, inscriptions and carefully designed arches. The surrounding complex also includes a mosque, royal tombs, gateways and unfinished structures.'}
      ],
      didYouKnow:[
        'The tower narrows from about 14.32 metres at its base to 2.75 metres near the top.',
        'Inscriptions in Arabic and Nagari scripts help reveal the monument’s history.',
        'The Qutb Minar and its Monuments became a UNESCO World Heritage Site in 1993.'
      ],
      sources:[
        {label:'UNESCO World Heritage Centre',url:'https://whc.unesco.org/en/list/233/'},
        {label:'Ministry of Culture, Government of India',url:'https://culture.gov.in/qutb-minar-and-its-monuments'},
        {label:'Incredible India',url:'https://www.incredibleindia.gov.in/en/delhi/delhi/qutub-minar'}
      ]
    }
  },
  {
    id:'fort',
    viewerId:'fort',
    name:'Red Fort',
    learningImage:learningPhotos.redFort,
    location:'Delhi',
    era:'Mughal architecture',
    period:'1639–1648',
    source:'https://whc.unesco.org/en/list/231/',
    summary:'Built as the palace fort of Shahjahanabad under Shah Jahan, the Red Fort combines defensive walls with palace spaces.',
    hotspots:[
      {id:'gate', title:'A monumental entrance', position:[0,3,3.25], text:'An imposing gateway introduces the palace fort. Compare the scale of the entrance with the enclosing walls in this simplified model.'},
      {id:'walls', title:'Red sandstone walls', position:[-4,1.8,3], text:'The massive red sandstone walls give the fort its name and define its outer boundary.'},
      {id:'palace', title:'Palace pavilions', position:[0,2,-1], text:'Inside the fort, palace pavilions were connected by a water channel called Nahr-i-Behisht, the Stream of Paradise.'}
    ],
    timeline:[
      ['1639','Shah Jahan laid the foundation of the palace fort, after moving his capital to Delhi in 1638.'],
      ['1648','The fort was completed.'],
      ['After 1857','British military occupation altered parts of the complex.'],
      ['1947','In August 1947 the Indian flag was raised above the Lahori Gate, and Independence Day is still celebrated here.'],
      ['2007','The Red Fort Complex entered the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Which material gives the fort its name?', options:['White marble','Red sandstone','Blue tile'], answer:1, why:'The enclosing red sandstone walls give the Red Fort its name.'},
      {question:'The Red Fort was built as…', options:['A lighthouse','A stepwell','A palace fort'], answer:2, why:'It was the palace fort of Shahjahanabad.'},
      {question:'Which emperor built the Red Fort?', options:['Shah Jahan','Aurangzeb','Akbar'], answer:0, why:'Shah Jahan built it after moving his capital to Delhi.'},
      {question:'Which gate was the main entrance, on the west side facing Chandni Chowk?', options:['Delhi Gate','Lahori Gate','Ajmeri Gate'], answer:1, why:'The Lahori Gate is the main entrance; the Delhi Gate on the south was the second public gate.'},
      {question:'What was the Nahr-i-Bihisht?', options:['A royal throne','A defensive moat','A water channel called the Stream of Paradise'], answer:2, why:'It was the channel that ran through the palace pavilions.'},
      {question:'Which covered market leads from the Lahori Gate towards the drum house?', options:['Khari Baoli','Chhatta Chowk','Sadar Bazaar'], answer:1, why:'The Lahori Gate opens into the vaulted Chhatta Chowk, which leads to the Naubat Khana.'}
    ],
    additionalInfo:{
      intro:'Explore how the Red Fort brought together powerful defensive walls, elegant palace spaces and a carefully shaped relationship with water.',
      sections:[
        {title:'Red sandstone and white marble',body:'Massive red sandstone walls give the fort its name. Inside, royal buildings use white marble and detailed decoration. The contrast balances a sense of strength at the perimeter with refinement in the palace.',image:learningPhotos.redFort},
        {title:'The Stream of Paradise',body:'A water channel called Nahr-i-Behisht, meaning “Stream of Paradise,” ran through the royal apartments. Flowing water added beauty and helped create a cooler, peaceful atmosphere within the palace.'},
        {title:'The Palace of Colours',body:'The Rang Mahal was a royal residential building known for colourful decoration and mirrorwork. A water channel passed through the space, combining visual richness with cooling.'},
        {title:'A lost riverfront',body:'During Shah Jahan’s reign the Yamuna flowed beside the fort. The river has since changed course, so the fort no longer meets the water in the same way.'},
        {title:'A palace complex transformed',body:'After the British took control in 1857, many original palace buildings were demolished and replaced with military barracks. Only part of the original Mughal complex survives.'},
        {title:'Salimgarh within the complex',body:'The Red Fort Complex also includes Salimgarh Fort, built before Shah Jahan’s Red Fort. Together, the two forts preserve traces of different historical periods.'}
      ],
      didYouKnow:[
        'Construction began in 1639, and the fort was completed in 1648.',
        'Diwan-i-Khas was the Hall of Private Audience.',
        'The Red Fort Complex became a UNESCO World Heritage Site in 2007.',
        'India’s Prime Minister addresses the nation from the fort on Independence Day.'
      ],
      sources:[
        {label:'UNESCO World Heritage Centre',url:'https://whc.unesco.org/en/list/231/'},
        {label:'Incredible India',url:'https://www.incredibleindia.gov.in/en/delhi/delhi/red-fort'}
      ]
    }
  },
  {
    id:'jantar-mantar',
    viewerId:'jantar-mantar',
    name:'Jantar Mantar, Delhi',
    learningImage:learningPhotos.jantar,
    location:'New Delhi, Delhi',
    era:'18th-century astronomy',
    period:'1724',
    source:'https://www.incredibleindia.gov.in/en/delhi',
    summary:'An open-air observatory commissioned by Sawai Jai Singh II, with monumental masonry instruments built for naked-eye observation and astronomical calculations.',
    hotspots:[
      {id:'samrat',title:'Samrat Yantra',position:[0,4.3,1],text:'The great triangular gnomon of this sundial casts a shadow across graduated scales to indicate local solar time. This model simplifies the instrument and is not to scale.'},
      {id:'jai-prakash',title:'Jai Prakash Yantra',position:[-4,1.3,-2],text:'Concave, bowl-like structures map the sky and help observers locate celestial positions. The Delhi observatory includes a pair of Jai Prakash instruments.'},
      {id:'ram-yantra',title:'Ram Yantra',position:[4,1.5,0],text:'The paired cylindrical Ram Yantra instruments are used to measure the altitude and azimuth of celestial bodies.'},
      {id:'misra',title:'Misra Yantra',position:[-1,1.5,-5],text:'The Misra Yantra combines several forms to support astronomical comparisons and observations. It is distinctive to the Delhi observatory.'}
    ],
    timeline:[
      ['1724','The Delhi observatory was established under Sawai Jai Singh II.'],
      ['18th century','The observatory’s masonry instruments supported naked-eye astronomical observation and calculations.'],
      ['Today','The instruments remain a landmark of the history of observational astronomy in India.']
    ],
    quiz:[
      {question:'Who commissioned the Delhi observatory?',options:['Sawai Jai Singh II','Shah Jahan','Humayun'],answer:0,why:'Sawai Jai Singh II commissioned the Delhi Jantar Mantar as part of his observatory program.'},
      {question:'What is the main purpose of the observatory?',options:['To observe and calculate celestial positions','To defend the city','To mark royal graves'],answer:0,why:'Its large instruments were designed for naked-eye astronomical observations and calculations.'},
      {question:'Which instrument is a giant sundial?',options:['Ram Yantra','Samrat Yantra','Misra Yantra'],answer:1,why:'The Samrat Yantra is a monumental sundial whose shadow indicates local solar time.'},
      {question:'What shape describes the Ram Yantra instruments?',options:['Paired cylinders','A single tower','A square tomb'],answer:0,why:'The Ram Yantra consists of paired cylindrical instruments used to measure altitude and azimuth.'}
    ],
    additionalInfo:{
      intro:'At Jantar Mantar, monumental geometry turns the movements of the sky into observations that can be read from the ground.',
      sections:[
        {title:'An observatory built to study the sky',body:'Built in 1724 by Maharaja Sawai Jai Singh II of Jaipur, Jantar Mantar was designed to observe celestial movements and improve astronomical calculations. It was the first of five observatories he established in India.'},
        {title:'Architecture that measures',body:'The huge geometric structures are scientific instruments, not merely decoration. Built from masonry, they helped observers study the Sun and stars using shadows, angles and carefully marked scales.',image:learningPhotos.jantar},
        {title:'Samrat Yantra: reading time by shadow',body:'The Samrat Yantra is a giant sundial. As the Sun appears to move across the sky, its shadow moves across the instrument’s marked scale and indicates local solar time.'},
        {title:'Jai Prakash Yantra: a sky map in stone',body:'The bowl-shaped Jai Prakash structures have markings that help observers determine celestial positions.',image:learningPhotos.jantarJaiPrakash},
        {title:'Misra Yantra and seasonal measurements',body:'The composite Misra Yantra supported several astronomical measurements, including identifying the longest and shortest days of the year.'},
        {title:'Why the observatory matters',body:'Jantar Mantar demonstrates how mathematics, architecture and astronomy came together in 18th-century India. It is a protected historic monument, although surrounding buildings and worn markings limit its original observational accuracy.'}
      ],
      didYouKnow:[
        'Sawai Jai Singh II established five observatories in Delhi, Jaipur, Ujjain, Varanasi and Mathura.',
        'The giant structures were designed to make scientific measurements, not simply to look impressive.',
        'The Samrat Yantra’s moving shadow makes the Sun’s apparent movement across the sky visible.'
      ],
      sources:[
        {label:'Delhi Tourism',url:'https://www.delhitourism.gov.in/'},
        {label:'Incredible India — Delhi',url:'https://www.incredibleindia.gov.in/en/delhi'},
        {label:'Jantar Mantar instrument explanations',url:'https://www.jantarmantar.org/learn/observatories/instruments/index.html'}
      ]
    }
  },
  {
    id:'humayun',
    viewerId:'humayun',
    name:'Humayun’s Tomb',
    learningImage:learningPhotos.humayun,
    location:'Nizamuddin East, Delhi',
    era:'Mughal architecture',
    period:'1565–1572',
    source:'https://whc.unesco.org/en/list/232/',
    summary:'Commissioned by Empress Bega Begum in memory of Humayun, this red-sandstone and marble garden-tomb was designed by Persian architects Mirak Mirza Ghiyath and his son Sayyid Muhammad.',
    hotspots:[
      {id:'dome',title:'Central double dome',position:[0,7.2,0],text:'A high central dome crowns the mausoleum. The model simplifies the double-dome profile and proportions.'},
      {id:'arches',title:'Arched façade',position:[0,3,4.2],text:'Large recessed arches articulate the four-sided tomb and emphasize its central axis and symmetry.'},
      {id:'platform',title:'Raised platform',position:[-3.5,1.2,3.5],text:'The mausoleum stands on a high platform, lifting the tomb above the garden and shaping its monumental approach.'},
      {id:'chhatris',title:'Corner chhatris',position:[3.4,6.3,3.4],text:'Small domed pavilions crown the roof at the corners, balancing the central dome.'},
      {id:'garden',title:'Charbagh garden',position:[0,.4,9],text:'The garden follows a four-part charbagh plan, divided by paths and water channels around the tomb.'}
    ],
    timeline:[
      ['1556','Humayun died; his widow Bega Begum later commissioned his tomb.'],
      ['1565','Construction began under Bega Begum’s patronage.'],
      ['1572','The tomb was completed.'],
      ['1993','Humayun’s Tomb was inscribed on the UNESCO World Heritage List.'],
      ['1997–2003','A major conservation and restoration program was carried out.']
    ],
    quiz:[
      {question:'Who commissioned Humayun’s Tomb?',options:['Bega Begum','Mumtaz Mahal','Jahanara Begum'],answer:0,why:'Bega Begum, Humayun’s widow, commissioned the tomb in his memory.'},
      {question:'In which city is Humayun’s Tomb?',options:['Agra','Delhi','Jaipur'],answer:1,why:'The tomb is in Nizamuddin East, Delhi.'},
      {question:'What is the four-part garden layout called?',options:['Charbagh','Chahar taq','Diwan-i-Am'],answer:0,why:'The garden uses a charbagh plan, divided into four parts by paths and channels.'},
      {question:'When was Humayun’s Tomb inscribed on the UNESCO World Heritage List?',options:['1983','1993','2007'],answer:1,why:'Humayun’s Tomb was inscribed in 1993.'}
    ],
    additionalInfo:{
      intro:'Discover how stone, symmetry, a four-part garden and a double dome shaped this influential Mughal garden-tomb.',
      sections:[
        {title:'The story of the tomb',body:'Commissioned by Empress Bega Begum, Humayun’s Tomb was built between about 1565 and 1570 during Emperor Akbar’s reign. It honours Humayun, the second Mughal emperor.'},
        {title:'Red sandstone and white marble',body:'The contrast between red sandstone and white marble gives the tomb its distinctive appearance. Marble highlights the central dome and decorative details, while the warm sandstone brings colour and depth to the structure.',image:learningPhotos.humayun},
        {title:'A dome within a dome',body:'The double dome has a distinct outer profile and a separate inner ceiling. This layered construction lets the exterior dome rise high above the building while keeping the interior space in proportion.'},
        {title:'Architecture in a garden',body:'The tomb sits within a charbagh, a four-part garden divided by paths and water channels. The garden is an essential part of the design: its geometry frames the tomb and guides the approach.'},
        {title:'A landmark for later Mughal tombs',body:'The tomb’s symmetry, garden setting, arches and double dome helped shape later Mughal tomb architecture. The Taj Mahal developed this tradition further.'},
        {title:'A wider heritage complex',body:'The site includes other historic structures, including Isa Khan’s Tomb. Humayun’s Tomb became a UNESCO World Heritage Site in 1993, and conservation work has helped preserve its historic structure and garden.'}
      ],
      didYouKnow:[
        'UNESCO describes it as the first grand dynastic garden-tomb on the Indian subcontinent.',
        'The outer dome and inner ceiling are separate parts of its double-dome design.',
        'The wider complex includes Isa Khan’s Tomb.'
      ],
      sources:[
        {label:'UNESCO World Heritage Centre',url:'https://whc.unesco.org/en/list/232/'},
        {label:'Government of NCT of Delhi',url:'https://srdc.delhi.gov.in/en/srdc/humayun-tomb'},
        {label:'Aga Khan Trust for Culture',url:'https://www.nizamuddinrenewal.org/conservation/humayun-tomb/'}
      ]
    }
  }
];

const galleryOrder = ['taj', 'fort', 'qutub', 'jantar-mantar', 'humayun'];
export const galleryExhibits = galleryOrder
  .map((id) => monuments.find((monument) => monument.id === id))
  .filter(Boolean)
  .map(({ id, name }) => ({ id, name }));
