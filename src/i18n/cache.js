// Based on moduleStore/jsCache - make generic cache class in future as part of util?
import { sha512 } from '../util/hash';

let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const getCache = () => JSON.parse(hypercord.storage.get('hypercordi18nCache') || '{}');
export const purgeCache = () => hypercord.storage.remove('hypercordi18nCache');

export const updateCache = (lang, hash, hypercordStrings) => {
  let cache = getCache();

  cache[lang] = { hash, hypercordStrings };

  hypercord.storage.set('hypercordi18nCache', JSON.stringify(cache));
};

export const geti18nData = async (lang) => {
  const cache = getCache();

  if (cache[lang]) { // && moduleInfo.hash === cache[lang].hash) {
    return cache[lang].hypercordStrings;
  } else {
    const hypercordStrings = await hypercordScope.i18n.geti18nData(lang);
    const newHash = await sha512(JSON.stringify(hypercordStrings));

    updateCache(lang, newHash, hypercordStrings);

    return hypercordStrings;
  }
};