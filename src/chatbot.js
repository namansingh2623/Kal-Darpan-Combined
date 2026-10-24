import {monuments} from './data';

const facts={
  taj:{
    builder:'Shah Jahan commissioned the Taj Mahal in memory of Mumtaz Mahal.',
    material:'The Taj Mahal is a white-marble mausoleum.',
    known:'The Taj Mahal is a white-marble mausoleum commissioned by Shah Jahan in memory of Mumtaz Mahal. It stands beside the Yamuna in Agra.',
    features:'Look for the central dome, four minarets at the platform corners, and the symmetrical garden.'
  },
  qutub:{
    builder:'Construction of the Qutub Minar began during the early Delhi Sultanate in the late 12th century. Successors extended the tower.',
    material:'The Qutub Minar is a tapering masonry tower with projecting balconies marking its storeys.',
    known:'The Qutub Minar is a tall, tapering minaret in Delhi. Its construction began in the late 12th century during the early Delhi Sultanate, and successors extended it.',
    features:'Notice how the tower narrows as it rises and how projecting balconies mark its storeys. The minaret is part of the wider Qutb complex.'
  },
  fort:{
    builder:'Shah Jahan established the Red Fort as the palace fort of Shahjahanabad.',
    material:'The Red Fort’s massive red sandstone walls give it its name.',
    known:'The Red Fort is a palace fort in Delhi, established by Shah Jahan for Shahjahanabad. Its defensive walls enclose palace spaces.',
    features:'Look for the monumental entrance and massive red sandstone walls. Inside were palace pavilions connected by the Nahr-i-Behisht, or Stream of Paradise.'
  }
};

const names={
  taj:['taj mahal','taj'],
  qutub:['qutub minar','qutb minar','qutub','qutb'],
  fort:['red fort','lal qila']
};

function normalize(text){
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
}

function findMonument(query){
  return Object.entries(names).find(([,aliases])=>aliases.some(alias=>query.includes(alias)))?.[0];
}

export function answerMuseumQuestion(input,previousMonumentId=null){
  const query=normalize(input);
  const selectedId=findMonument(query)||previousMonumentId;
  const selected=monuments.find(monument=>monument.id===selectedId);

  if(/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(query)){
    return {text:'Hello! I can answer questions about the Taj Mahal, Qutub Minar, and Red Fort. Try asking “Who built the Red Fort?”',monumentId:selectedId};
  }
  if(/\b(help|what can you do|ask)\b/.test(query)){
    return {text:'Ask me about a monument’s location, history, builder, materials, or architectural features. I can also compare all three.',monumentId:selectedId};
  }
  if(/\b(compare|comparison|differences|difference|all three|three monuments|similarities)\b/.test(query)){
    return {text:'The Taj Mahal in Agra is Shah Jahan’s white-marble mausoleum. Delhi’s Qutub Minar is a tapering minaret begun in the late 12th century. The Red Fort, also in Delhi, is Shah Jahan’s palace fort, known for its red sandstone walls.',monumentId:null};
  }
  if(!selected){
    if(/\b(monuments|which ones|what are they|collection)\b/.test(query)){
      return {text:'This museum features the Taj Mahal in Agra, the Qutub Minar in Delhi, and the Red Fort in Delhi. Ask about any one of them to learn more.',monumentId:null};
    }
    return {text:'Which monument would you like to know about: the Taj Mahal, Qutub Minar, or Red Fort? You can ask about its location, history, builder, materials, or features.',monumentId:null};
  }

  if(/\b(where|location|located|city|place)\b/.test(query)){
    return {text:`${selected.name} is in ${selected.location}.`,monumentId:selected.id};
  }
  if(/\b(who|built|builder|commissioned|founded|made)\b/.test(query)){
    return {text:facts[selected.id].builder,monumentId:selected.id};
  }
  if(/\b(when|date|year|period|century|old|age|started|began|completed)\b/.test(query)){
    return {text:`${selected.name}: ${selected.period}. ${selected.timeline[0][1]}`,monumentId:selected.id};
  }
  if(/\b(material|made of|stone|marble|sandstone)\b/.test(query)){
    return {text:facts[selected.id].material,monumentId:selected.id};
  }
  if(/\b(feature|architecture|architectural|design|dome|minaret|garden|wall|gate|fort|tower)\b/.test(query)){
    return {text:facts[selected.id].features,monumentId:selected.id};
  }
  if(/\b(why|famous|known|significance|important|about|story)\b/.test(query)){
    return {text:facts[selected.id].known,monumentId:selected.id};
  }
  return {text:`${selected.summary} Ask me about its location, history, builder, materials, or architectural features.`,monumentId:selected.id};
}
