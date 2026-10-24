// Registry. To add a monument: create monuments/<id>.js and add one import + one entry below.
import taj from './monuments/taj.js';
import qutub from './monuments/qutub.js';
import fort from './monuments/fort.js';
import jantarMantar from './monuments/jantar-mantar.js';
import humayun from './monuments/humayun.js';

export const monumentsData = { taj, qutub, fort, 'jantar-mantar': jantarMantar, humayun };
export const monumentList = Object.values(monumentsData);
export const getMonument = (id) => monumentsData[id] || null;
