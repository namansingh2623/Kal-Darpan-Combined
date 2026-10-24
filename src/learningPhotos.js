const licenseUrls = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const photo = (src, alt, caption, author, license, source) => ({
  src,
  alt,
  caption,
  author,
  license,
  licenseUrl: licenseUrls[license],
  source,
});

export const learningPhotos = {
  taj: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Taj_Mahal_full_view.jpg/1280px-Taj_Mahal_full_view.jpg',
    'Photograph of the Taj Mahal in Agra.',
    'Taj Mahal, Agra.',
    'DeyaRoy',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Taj_Mahal_full_view.jpg',
  ),
  tajInlay: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Art_Work_inside_Taj_Mahal_01.JPG/1280px-Art_Work_inside_Taj_Mahal_01.JPG',
    'Photograph of carved floral marble and pietra dura inlay inside the Taj Mahal.',
    'Carved marble and pietra dura inlay inside the Taj Mahal.',
    'Rajesnewdelhi',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Art_Work_inside_Taj_Mahal_01.JPG',
  ),
  qutub: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Delhi%2C_Qutub_Minar_complex_%2829682024557%29.jpg/1280px-Delhi%2C_Qutub_Minar_complex_%2829682024557%29.jpg',
    'Photograph of the Qutb Minar and surrounding complex in Delhi.',
    'Qutb Minar complex, Delhi.',
    'juggadery',
    'CC BY 2.0',
    'https://commons.wikimedia.org/wiki/File:Delhi,_Qutub_Minar_complex_(29682024557).jpg',
  ),
  qutubSandstone: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Red_sandstone_detailing_on_Qutub_minar.jpg/1280px-Red_sandstone_detailing_on_Qutub_minar.jpg',
    'Close-up photograph of the red sandstone fluting and carved bands of Qutub Minar.',
    'Red sandstone fluting and carved detail on Qutub Minar.',
    'Muhammed Rijas K',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Red_sandstone_detailing_on_Qutub_minar.jpg',
  ),
  redFort: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Delhi%2C_India%2C_Red_Fort_Facade.jpg/960px-Delhi%2C_India%2C_Red_Fort_Facade.jpg',
    'Photograph of the Red Fort facade and its red sandstone walls in Delhi.',
    'Red sandstone facade of the Red Fort, Delhi.',
    'Vyacheslav Argenberg',
    'CC BY 4.0',
    'https://commons.wikimedia.org/wiki/File:Delhi,_India,_Red_Fort_Facade.jpg',
  ),
  humayun: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Humayun_Tomb%2C_Delhi%2C_running_fountain.jpg/1280px-Humayun_Tomb%2C_Delhi%2C_running_fountain.jpg',
    'Photograph of Humayun’s Tomb and its garden water channels.',
    'Humayun’s Tomb with the garden fountain and water channel.',
    'Dennis G. Jarvis',
    'CC BY-SA 2.0',
    'https://commons.wikimedia.org/wiki/File:Humayun_Tomb,_Delhi,_running_fountain.jpg',
  ),
  jantar: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Jantar_Mantar%2C_Delhi%2C_India_2.jpg/1280px-Jantar_Mantar%2C_Delhi%2C_India_2.jpg',
    'Photograph of the historic Jantar Mantar observatory in Delhi.',
    'Jantar Mantar, Delhi.',
    'ABHIJITJAWANJAL',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:Jantar_Mantar,_Delhi,_India_2.jpg',
  ),
  jantarJaiPrakash: photo(
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Jai_Prakash_at_Jantar_Mantar%2C_Delhi_%287987724659%29.jpg/1280px-Jai_Prakash_at_Jantar_Mantar%2C_Delhi_%287987724659%29.jpg',
    'Photograph of the bowl-shaped Jai Prakash instrument at Jantar Mantar, Delhi.',
    'Jai Prakash Yantra, Jantar Mantar, Delhi.',
    'Varun Shiv Kapur',
    'CC BY 2.0',
    'https://commons.wikimedia.org/wiki/File:Jai_Prakash_at_Jantar_Mantar,_Delhi_(7987724659).jpg',
  ),
};
