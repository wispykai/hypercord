import sleep from '../../util/sleep';

import * as GMSettings from '../../gmSettings';
export const gmSettings = GMSettings;

import addToHome from './home/index';
import addToContextMenu from './contextMenu';
import addToSettingsSidebar from './settingsSidebar';

import addBaseItems from './baseItems';

import addCustomCss from './css';

import getItems from './items';
let Items = {};

let hypercordScope = {};

export const setThisScope = async (scope) => {
  hypercordScope = scope;

  Items = await getItems();
};


export const removeModuleUI = (field, where) => {
  // let settingItem = hypercordScope.settings.items.find((x) => x[1] === 'Local Modules');

  // settingItem[2].splice(settingItem[2].indexOf(settingItem[2].find((x) => x.subtext === hypercordScope.modules[field].description)), 1);

  const isDisabled = hypercordScope.modules[field] === undefined; // If module is currently disabled
  if (isDisabled) {
    hypercordScope.modules[field] = Object.assign({}, hypercordScope.disabledModules[field]); // Move from disabledModules -> modules
    delete hypercordScope.disabledModules[field];
  }

  hypercordScope.moduleStoreAPI.moduleRemoved(hypercordScope.modules[field]);

  if (!isDisabled) hypercordScope.modules[field].hypercordHandlers.onRemove();

  delete hypercordScope.modules[field];

  hypercordScope.moduleSettingsStore.clearModuleSetting(field);

  // hypercordScope.settings.createFromItems();

  if (where) hypercordScope.settings.openSettingItem(where);
};

export const isSettingsOpen = () => {
  return document.querySelector('div[aria-label="USER_SETTINGS"] .closeButton-1tv5uR') !== null;
};

export const closeSettings = () => {
  let closeEl = document.querySelector('div[aria-label="USER_SETTINGS"] .closeButton-1tv5uR');
  
  if (closeEl === null) return false;
  
  closeEl.click(); // Close settings via clicking the close settings button
};

export const openSettings = () => {
  document.querySelector('.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6 > [type="button"]:last-child').click();
};

export const openSettingItem = (name) => {
  try {
    const children = [...(document.querySelector('div[aria-label="USER_SETTINGS"]').querySelector('nav > div')).children];

    children[1].click(); // To refresh / regenerate

    setTimeout(() => children.find((x) => x.textContent === name).click(), 5);

    return true;
  } catch (e) {
    return false;
  }
};

export const reopenSettings = async () => {
  hypercordScope.settings.closeSettings();

  await sleep(500);

  hypercordScope.settings.openSettings();

  await sleep(100);
};

export let items = [];

export const createItem = (panelName, content, clickHandler, danger = false) => {
  hypercordScope.settings.items.push(['item', panelName, content, clickHandler, danger]);
};

export const removeItem = (setting) => {
  const ind = hypercordScope.settings.items.indexOf(hypercordScope.settings.items.find((x) => x[1] === setting));

  // Trying to remove non-existant item
  if (ind === -1) return false;

  hypercordScope.settings.items.splice(ind, 1);
};

export const createHeading = (headingName) => {
  hypercordScope.settings.items.push(['heading', headingName]);
};

export const createSeparator = () => {
  hypercordScope.settings.items.push(['separator']);
};

export const _createItem = (name, content, container = true) => {
  const { React } = hypercordScope.webpackModules.common;

  const FormSection = hypercordScope.webpackModules.findByDisplayName('FormSection');
  const FormTitle = hypercordScope.webpackModules.findByDisplayName('FormTitle');

  const makeContent = () => content.slice(1).map((x, i) => {
    if (x.type.includes('danger-button')) {
      x.type = x.type.replace('danger-', '');
      x.danger = true;
    }

    const component = Items[x.type];

    if (!component) return React.createElement('div');

    return React.createElement(component, {
      i,
      ...x,
      itemName: name
    });
  });

  return container ? React.createElement(FormSection, {
      className: name === hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins || name === hypercordScope.i18n.hypercordStrings.settings.itemNames.themes ? 'gm-store-settings' : ''
    },

    React.createElement(FormTitle, { tag: 'h1' }, name),

    makeContent()
  ) : React.createElement('div', { },
    makeContent()
  );
};

export const makehypercordSettings = () => {
  hypercordScope.settingsUninjects = [];

  addBaseItems(hypercordScope, gmSettings, Items);

  addToSettingsSidebar(hypercordScope, gmSettings);
  addToContextMenu(hypercordScope, gmSettings.get().home);
  if (gmSettings.get().home) addToHome(hypercordScope);

  addCustomCss();

  loadColorPicker();
};

const loadColorPicker = () => { // Force load ColorPicker as it's dynamically loaded
  const { findInReactTree } = hypercordScope.reactUtils;

  if (!hypercordScope.webpackModules.findByDisplayName('ColorPicker')) {
    const GuildFolderSettingsModal = hypercordScope.webpackModules.findByDisplayName('GuildFolderSettingsModal');
    const instance = GuildFolderSettingsModal.prototype.render.call({ props: {}, state: {}});
  
    findInReactTree(instance.props.children, (x) => x.props?.colors).type().props.children.type._ctor();
  }
};