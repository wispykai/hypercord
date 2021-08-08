let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};


export const disableModule = (name) => {
  let settings = JSON.parse(hypercord.storage.get('hypercordDisabled')) || {};

  settings[name] = true;

  hypercord.storage.set('hypercordDisabled', JSON.stringify(settings));
};

export const enableModule = (name) => {
  let settings = JSON.parse(hypercord.storage.get('hypercordDisabled')) || {};

  delete settings[name];

  hypercord.storage.set('hypercordDisabled', JSON.stringify(settings));
};

export const checkDisabled = (name) => {
  return Object.keys(JSON.parse(hypercord.storage.get('hypercordDisabled')) || {}).includes(name);
};


export const saveModuleSettings = async () => {
  //hypercordScope.logger.debug('settings', 'Saving module settings...');

  let settings = JSON.parse(hypercord.storage.get('hypercordModules')) || {};

  for (let p in hypercordScope.modules) {
    if (hypercordScope.modules.hasOwnProperty(p)) {
      settings[p] = await (hypercordScope.modules[p].hypercordHandlers.getSettings || (async () => []))();
    }
  }

  if (JSON.stringify(JSON.parse(hypercord.storage.get('hypercordModules'))) !== JSON.stringify(settings)) {
    hypercord.storage.set('hypercordModules', JSON.stringify(settings));

    // hypercordScope.showToast('Settings saved');
  }
};

export const clearModuleSetting = (moduleName) => {
  let settings = JSON.parse(hypercord.storage.get('hypercordModules'));

  if (!settings || !settings[moduleName]) return;

  delete settings[moduleName];

  hypercord.storage.set('hypercordModules', JSON.stringify(settings));
};

export const clearSettings = () => {
  hypercord.storage.remove('hypercordModules');
};

export const loadSavedModuleSetting = async (moduleName) => {
  let settings = JSON.parse(hypercord.storage.get('hypercordModules'));

  if (!settings || !settings[moduleName]) return;

  await (hypercordScope.modules[moduleName].hypercordHandlers.loadSettings || (async () => []))(settings[moduleName]);
};

/* export const loadSavedModuleSettings = async () => {
  //hypercordScope.logger.debug('settings', 'Loading module settings...');

  let settings = JSON.parse(hypercord.storage.get('hypercordModules'));

  if (!settings) return;

  for (let p in hypercordScope.modules) {
    if (hypercordScope.modules.hasOwnProperty(p) && settings.hasOwnProperty(p)) {
      await (hypercordScope.modules[p].hypercordßHandlers.loadSettings || (async () => []))(settings[p]);
    }
  }

  return settings;
}; */