let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const getCache = () => JSON.parse(hypercord.storage.get('hypercordJSCache') || '{}');
export const purgeCache = () => hypercord.storage.remove('hypercordJSCache');

export const updateCache = (moduleName, hash, js) => {
  let cache = hypercordScope.moduleStoreAPI.jsCache.getCache();

  cache[moduleName] = {hash, js};

  hypercord.storage.set('hypercordJSCache', JSON.stringify(cache));
};

export const getJSForModule = async (moduleName) => {
  const moduleInfo = hypercordScope.moduleStoreAPI.modules.find((x) => x.name === moduleName);
  const cache = hypercordScope.moduleStoreAPI.jsCache.getCache();

  if (cache[moduleName] && moduleInfo.hash === cache[moduleName].hash) {
    return cache[moduleName].js;
  } else {
    const baseUrl = moduleInfo.repo.split('/').slice(0, -1).join('/');

    const js = await (await fetch(`${baseUrl}/module/${moduleName}.js?_=${Date.now()}`)).text();

    hypercordScope.moduleStoreAPI.jsCache.updateCache(moduleName, moduleInfo.hash, js);

    return js;
  }
};