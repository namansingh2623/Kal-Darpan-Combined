// Hindi / Urdu / Persian terms -> text the TTS voice can say correctly.
// 'devanagari' (default): the multilingual model reads Devanagari with Hindi phonology, which is far
//                         more reliable than English-style respelling (that is what produced "chutries").
// 'respell'             : plain-English respelling, kept as a fallback per term and as a global switch.
export const PRONUNCIATION_MODE = 'devanagari'; // 'devanagari' | 'respell'

// term(written form in the content, Devanagari, respelling, optional regex source if it differs from `written`)
// Matches whole words only (no backslashes needed) and swallows a trailing possessive ('s).
const term = (written, deva, say, pattern = written) => ({
  written,
  deva,
  say,
  re: new RegExp(`(?<![A-Za-z])(?:${pattern})(’s|'s)?(?![A-Za-z])`, 'gi'),
});

// ORDER MATTERS: full names and phrases first, single words after.
export const LEXICON = [
  term('Quwwat-ul-Islam', 'क़ुव्वत-उल-इस्लाम', 'Kuw-wat-ul-Is-laam', 'Quwwat(?:u.l|-ul)-Islam'),
  term('Qutb ud-Din', 'कुतुबुद्दीन', 'Kutub-ud-Deen', 'Qutb[ -]ud-Din'),
  term('Sawai Jai Singh II', 'सवाई जय सिंह द्वितीय', 'Suh-wai Jai Singh the Second'),
  term('Samrat Yantra', 'सम्राट यंत्र', 'Sam-raat Yan-tra'),
  term('Jai Prakash Yantra', 'जय प्रकाश यंत्र', 'Jai Pra-kaash Yan-tra'),
  term('Mirak Mirza Ghiyath', 'मिराक मिर्ज़ा ग़ियास', 'Mee-raaq Meer-zaa Ghee-yaath'),
  term('Sayyid Muhammad', 'सैयद मुहम्मद', 'Sai-yid Mu-hum-mad'),
  term('Jantar Mantar', 'जंतर मंतर', 'Jan-tar Man-tar'),
  term('Bega Begum', 'बेगा बेगम', 'Bay-ga Bay-gum'),
  term('Haji Begum', 'हाजी बेगम', 'Haa-jee Bay-gum'),
  term('Ram Yantra', 'राम यंत्र', 'Raam Yan-tra'),
  term('Misra Yantra', 'मिश्र यंत्र', 'Mish-ra Yan-tra'),
  term('Humayun', 'हुमायूँ', 'Hu-may-yoon'),
  term('Alai Darwaza', 'अलाई दरवाज़ा', 'Aa-laa-ee Dar-waa-zaa'),
  term('Chandni Chowk', 'चाँदनी चौक', 'Chaand-nee Chawk'),
  term('Chhatta Chowk', 'छत्ता चौक', 'Chut-taa Chawk'),
  term('Khari Baoli', 'खारी बावली', 'Khaa-ree Baa-oo-lee'),
  term('Sadar Bazaar', 'सदर बाज़ार', 'Sa-dar Ba-zaar'),
  term('Lal Qila', 'लाल क़िला', 'Laal Kil-laa'),
  term('Uttar Pradesh', 'उत्तर प्रदेश', 'Ut-tar Pra-daysh'),
  term('Shahjahanabad', 'शाहजहाँनाबाद', 'Shaah-ja-haan-aa-baad'),
  term('Shah Jahan', 'शाहजहाँ', 'Shaah Ja-haan'),
  term('Bahadur Shah Zafar', 'बहादुर शाह ज़फ़र', 'Buh-haa-dur Shaah Zuh-far'),
  term('Nadir Shah', 'नादिर शाह', 'Naa-dir Shaah'),
  term('Firuz Shah', 'फ़ीरोज़ शाह', 'Fee-roze Shaah'),
  term('Diwan-i-Am', 'दीवान-ए-आम', 'Dee-waan-eh-Aam'),
  term('Diwan-i-Khas', 'दीवान-ए-ख़ास', 'Dee-waan-eh-Khaas'),
  term('Nahr-i-Bihisht', 'नहर-ए-बिहिश्त', 'Nahr-eh-Bih-isht', 'Nahr-i-B[ie]hisht'),
  term('naubat khana', 'नौबत खाना', 'now-bat khaa-naa'),
  term('pietra dura', '', 'pee-eh-tra doo-raa'), // Italian, not Hindi: respelling only
  term('ASI', '', 'A S I'),
  term('Alauddin', 'अलाउद्दीन', 'Aa-laa-ud-deen'),
  term('Khalji', 'ख़िलजी', 'Khil-jee'),
  term('Qutub', 'कुतुब', 'Kutub', 'Qut(?:u|a)?b'),
  term('Yantra', 'यंत्र', 'Yan-tra'),
  term('Minar', 'मीनार', 'Mee-naar'),
  term('Darwaza', 'दरवाज़ा', 'Dar-waa-zaa'),
  term('Ajmeri', 'अजमेरी', 'Aj-meh-ree'),
  term('Aibak', 'ऐबक', 'Ay-bak'),
  term('Iltutmish', 'इल्तुतमिश', 'Il-tut-mish'),
  term('Tughlaq', 'तुग़लक़', 'Tugh-luk'),
  term('Firuz', 'फ़ीरोज़', 'Fee-roze'),
  term('Mumtaz', 'मुमताज़', 'Mum-taaz'),
  term('Mughal', 'मुग़ल', 'Moo-gul'),
  term('Mehrauli', 'मेहरौली', 'Meh-rau-lee'),
  term('Yamuna', 'यमुना', 'Yuh-moo-naa'),
  term('Lahori', 'लाहौरी', 'Laa-hor-ee'),
  term('Lahore', 'लाहौर', 'Laa-hor'),
  term('Ustad', 'उस्ताद', 'Us-taad'),
  term('Ahmad', 'अहमद', 'Ah-mad'),
  term('Qila', 'क़िला', 'Kil-laa'),
  term('Zafar', 'ज़फ़र', 'Zuh-far'),
  term('Bahadur', 'बहादुर', 'Buh-haa-dur'),
  term('Nadir', 'नादिर', 'Naa-dir'),
  term('Chandragupta', 'चंद्रगुप्त', 'Chun-dra-gup-ta'),
  term('Chandra', 'चंद्र', 'Chun-dra'),
  term('Gupta', 'गुप्त', 'Gup-ta'),
  term('chhatris', 'छत्रियाँ', 'chuht-reez'),
  term('chhatri', 'छत्री', 'chuht-ree'),
  term('jharokhas', 'झरोखे', 'juh-roh-khay'),
  term('jharokha', 'झरोखा', 'juh-roh-khaa'),
  term('chhajjas', 'छज्जे', 'chuj-jay'),
  term('chhajja', 'छज्जा', 'chuj-jaa'),
  term('jaalis', 'जालियाँ', 'jaa-lee-yaan'),
  term('jaali', 'जाली', 'jaa-lee'),
  term('chhatta', 'छत्ता', 'chut-taa'),
  term('chowk', 'चौक', 'chawk'),
  term('baoli', 'बावली', 'baa-oo-lee'),
  term('iwans', 'ईवान', 'ee-waan'),
  term('iwan', 'ईवान', 'ee-waan'),
  term('charbagh', 'चारबाग़', 'chaar-baagh'),
  term('jawab', 'जवाब', 'juh-waab'),
];

export function applyPronunciations(text, mode = PRONUNCIATION_MODE) {
  let out = String(text);
  for (const entry of LEXICON) {
    const useDeva = mode === 'devanagari' && entry.deva;
    // Devanagari drops the English possessive; respelling keeps it.
    out = out.replace(entry.re, (_match, possessive = '') => (useDeva ? entry.deva : entry.say + possessive));
  }
  return out;
}

// Spoken by the Test voice button: a few real sentences, then every term in groups of eight.
const groups = [];
for (let i = 0; i < LEXICON.length; i += 8) {
  groups.push(LEXICON.slice(i, i + 8).map((entry) => entry.written).join('. ') + '.');
}
export const PRONUNCIATION_TEST = [
  'Chhatris, jharokhas, jaalis and chhajjas frame the iwan.',
  'Qutb ud-Din Aibak began the Qutub Minar; Iltutmish and Firuz Shah Tughlaq continued it.',
  'The Alai Darwaza stands in Mehrauli, near the Quwwat-ul-Islam mosque.',
  'Shah Jahan built Shahjahanabad. Its Lahori Gate opens onto Chhatta Chowk and Chandni Chowk.',
  'Nahr-i-Bihisht, the Stream of Paradise, flows past the Diwan-i-Am and the naubat khana.',
  'Ustad Ahmad Lahori worked beside the Yamuna on the charbagh at the Taj Mahal.',
  'Sawai Jai Singh II commissioned Jantar Mantar in Delhi. The Samrat Yantra, Jai Prakash Yantra, Ram Yantra and Misra Yantra are astronomical instruments.',
  'Bega Begum, also known as Haji Begum, commissioned Humayun’s Tomb, designed by Mirak Mirza Ghiyath and Sayyid Muhammad.',
  ...groups,
];