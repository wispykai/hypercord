import sleep from '../../util/sleep';

export default (hypercordScope, hasStoreInHome) => {
  const basicSettingItem = (name) => {
    return {
      label: name,
      action: async () => {
        hypercordScope.settings.openSettings();

        await sleep(10);

        [...(document.getElementsByClassName('side-8zPYf6')[0]).children].find((x) => x.textContent === name).click();
      }
    };
  };

  hypercordScope.settingsUninjects.push(hypercordScope.patcher.contextMenu.patch('user-settings-cog', {
    label: 'hypercord',
    sub: [
      basicSettingItem(hypercordScope.i18n.discordStrings.SETTINGS),
      !hasStoreInHome ? basicSettingItem(hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins) : undefined,
      !hasStoreInHome ? basicSettingItem(hypercordScope.i18n.hypercordStrings.settings.itemNames.themes) : undefined,
      basicSettingItem(hypercordScope.i18n.discordStrings.CHANGE_LOG)
    ].filter((x) => x)
  }));

  hypercordScope.settingsUninjects.push(hypercordScope.patcher.contextMenu.patch('user-settings-cog', {
    label: hypercordScope.i18n.hypercordStrings.settings.itemNames.hypercordModules,
    sub: () => {
      const moduleItems = hypercordScope.settings.items.slice(hypercordScope.settings.items.indexOf(hypercordScope.settings.items.find((x) => x[1] === hypercordScope.i18n.hypercordStrings.settings.itemNames.hypercordModules)) + 1);

      return moduleItems.map((x) => basicSettingItem(x[1]));
    }
  }));
};