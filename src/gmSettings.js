let cache;

const defaultSettings = {
  changelog: true,
  separators: true,
  gmBadges: true,
  attrs: false,
  home: true,

  devchannel: false,

  snippets: false,
  autoupdate: true,

  allThemeSettings: false,
  debugToasts: false
};

export const get = () => {
  // Cache as this function is called frequently
  if (cache) return cache;
  
  cache = JSON.parse(hypercord.storage.get('hypercordGMSettings')) || defaultSettings;

  cache = {
    ...defaultSettings,
    ...cache
  };

  return cache;
};

export const set = (key, value) => {
  const settings = get();

  settings[key] = value;

  hypercord.storage.set('hypercordGMSettings', JSON.stringify(settings));

  cache = settings; // Set cache to new value
};