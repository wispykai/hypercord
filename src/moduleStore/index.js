import { verifySignature } from './pgp';
import { sha512 } from '../util/hash';

import * as JSCache from './jsCache';
import * as IDCache from './idCache';

let hypercordScope = {};

export default {
  setThisScope: (scope) => {
    hypercordScope = scope;

    JSCache.setThisScope(scope);
    IDCache.setThisScope(scope);
  },

  modules: [],
  repos: [],

  apiBaseURL: 'https://api.hypercord.com',
  storeApiBaseURL: 'https://store.hypercord.com',

  jsCache: JSCache,
  idCache: IDCache,

  getSettingItemName: (moduleInfo) => {
    let item = hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins;

    if (moduleInfo.tags.includes('theme')) item = hypercordScope.i18n.hypercordStrings.settings.itemNames.themes;

    return item;
  },

  hotupdate: async (shouldHandleLoadingText = false) => { // Update repos, hotreload any updated modules (compare hashes to check if updated)
    if (shouldHandleLoadingText) hypercordScope.updateLoadingScreen(`Getting modules from repos...`);

    await hypercordScope.moduleStoreAPI.updateModules();
  
    await hypercordScope.moduleStoreAPI.updateStoreSetting();

    if (shouldHandleLoadingText) hypercordScope.updateLoadingScreen(`Updating modules...`);

    const repoPgpChecks = {};

    const updatePromises = [];

    for (const m in hypercordScope.modules) {
      const msHash = hypercordScope.moduleStoreAPI.modules.find((x) => x.name === m)?.hash;

      const cacheHash = hypercordScope.moduleStoreAPI.jsCache.getCache()[m]?.hash;

      if (msHash === undefined || cacheHash === undefined || msHash === cacheHash) continue;

      if (repoPgpChecks[m.repo] === undefined) { // Force check repo's PGP if updating from there
        const repo = hypercordScope.moduleStoreAPI.repos.find((x) => x.url === m.repo);

        const pgpUntrusted = hypercordScope.moduleStoreAPI.verifyPgp(repo).trustState === 'untrusted';

        if (pgpUntrusted) { // Repo PGP failed to verify and once had PGP success, refuse to update modules for this repo
          hypercordScope.showToast(`Failed to verify repo ${repo.meta.name}, refusing to update it's modules`, { timeout: 10000, type: 'error', subtext: 'hypercord Store (PGP)' });
          repoPgpChecks[m.repo] = false;
          continue;
        }

        repoPgpChecks[m.repo] = true;
      }

      if (repoPgpChecks[m.repo] === false) continue; // Failed to verify PGP, skip

      // New update for it, cached JS != repo JS hashes
      if (shouldHandleLoadingText) hypercordScope.updateLoadingScreen(`Updating modules...\n${m}`);

      updatePromises.push(hypercordScope.moduleStoreAPI.importModule(m, hypercordScope.moduleSettingsStore.checkDisabled(m)).then(async () => {
        hypercordScope.showToast(`Updated ${m}`, { timeout: 5000, type: 'success', subtext: 'hypercord Store' });
      }));
    }

    await Promise.all(updatePromises);
  },

  initRepos: async () => {
    const getFirstMeta = async (url) => (await (await fetch(`${url}?_=${Date.now()}`)).json()).meta;
    const getFirstObj = async (url) => ({
      url,
      enabled: true,
      meta: await getFirstMeta(url)
    });

    hypercordScope.moduleStoreAPI.repos = JSON.parse(hypercord.storage.get('hypercordRepos')) || [
      await getFirstObj(`https://store.hypercord.com/hypercord.json`),
      await getFirstObj(`https://store.hypercord.com/ms2porter.json`),
      await getFirstObj(`https://store.hypercord.com/bdthemes.json`),
      await getFirstObj(`https://store.hypercord.com/pcthemes.json`),
      await getFirstObj(`https://store.hypercord.com/pcplugins.json`),
    ];
  },

  updateModules: async () => {
    let newModules = [];

    hypercordScope.moduleStoreAPI.repos = (await Promise.all(hypercordScope.moduleStoreAPI.repos.map(async (repo) => {
      if (!repo.enabled) {
        return repo;
      }

      try {
        const _resp = (await (await fetch(`${repo.url}?_=${Date.now()}`)).text());
        const resp = JSON.parse(_resp);

        const pgpUntrusted = await hypercordScope.moduleStoreAPI.verifyPgp(repo).trustState === 'untrusted';

        if (pgpUntrusted) {
          hypercordScope.showToast(`Failed to verify repo: ${repo.meta.name}, refusing to use new modules`, { timeout: 10000, type: 'error', subtext: 'hypercord Store (PGP)' });

          newModules = newModules.concat(hypercordScope.moduleStoreAPI.modules.filter((x) => x.repo === repo.url)).sort((a, b) => a.name.localeCompare(b.name)); // Use cached / pre-existing modules

          return repo;
        }


        newModules = newModules.concat(resp.modules.map((x) => {
          x.repo = repo.url;
          return x;
        })).sort((a, b) => a.name.localeCompare(b.name));

        return {
          ...repo,
          meta: resp.meta, // Update meta,
          resp: _resp // Store raw response (PGP caching)
        };
      } catch (e) {
        hypercordScope.showToast(`Failed to get repo: ${repo.url}`, { timeout: 5000, type: 'error', subtext: 'hypercord Store' }); // Show error toast to user so they know
        console.error(e);
      }

      return repo;
    }))).sort((a, b) => hypercordScope.moduleStoreAPI.repos.indexOf(a.url) - hypercordScope.moduleStoreAPI.repos.indexOf(b.url));

    hypercordScope.moduleStoreAPI.modules = newModules;

    hypercord.storage.set('hypercordRepos', JSON.stringify(hypercordScope.moduleStoreAPI.repos.map((x) => { delete x.resp; return x; }))); // Don't store raw responses
    hypercord.storage.set('hypercordCachedModules', JSON.stringify(hypercordScope.moduleStoreAPI.modules));
  },

  importModule: async (moduleName, disabled = false) => {
    try {
      const moduleInfo = hypercordScope.moduleStoreAPI.modules.find((x) => x.name === moduleName);

      const jsCode = await hypercordScope.moduleStoreAPI.jsCache.getJSForModule(moduleName);

      const calculatedHash = await sha512(jsCode);
      if (calculatedHash !== moduleInfo.hash) {
        hypercordScope.showToast(`Cancelled importing of ${moduleName} due to hash mismatch`, { timeout: 2000, type: 'danger', subtext: 'hypercord Store' });

        console.warn('Hash mismatch', calculatedHash, moduleInfo.hash);
        return;
      }

      await hypercordScope.importModule({
        name: moduleName,
        data: jsCode,
        metadata: moduleInfo
      }, disabled);

      if (!disabled) {
        if (hypercordScope.modules[moduleName].hypercordHandlers.onLoadingFinished !== undefined) {
          await hypercordScope.modules[moduleName].hypercordHandlers.onLoadingFinished();
        }

        await hypercordScope.moduleSettingsStore.loadSavedModuleSetting(moduleName);
      }

      try {
        const item = hypercordScope.settings.items.find((x) => x[1] === hypercordScope.moduleStoreAPI.getSettingItemName(moduleInfo))[2].find((x) => x.subtext === moduleInfo.description);

        item.buttonType = 'danger';
        item.buttonText = hypercordScope.i18n.discordStrings.REMOVE;
        item.showToggle = true;
      } catch (e) {
        // hypercordScope.logger.debug('import', 'Failed to change setting during MS importModule (likely during initial imports so okay)');
      }

      // If themes / plugins open
      if (document.querySelector(`#gm-settings-inject`)) {
        const cardEls = [...document.querySelectorAll(`.title-31JmR4 + .colorStandard-2KCXvj`)].filter((x) => x.textContent === moduleInfo.description).map((x) => x.parentElement);

        if (cardEls.length === 0) return;

        for (const cardEl of cardEls) {
          const buttonEl = cardEl.querySelector(`.colorBrand-3pXr91`);

          buttonEl.className = buttonEl.className.replace('lookFilled-1Gx00P colorBrand-3pXr91', 'lookOutlined-3sRXeN colorRed-1TFJan');
          buttonEl.textContent = hypercordScope.i18n.discordStrings.REMOVE;

          const toggleEl = cardEl.querySelector(`.container-3auIfb`);
          toggleEl.classList.remove('hide-toggle');
        }
      }
    } catch (e) {
      hypercordScope.showToast(`Failed to import module ${moduleName}`, { timeout: 2000, type: 'error', subtext: 'hypercord Store' });
      console.error(e);
    }
  },

  moduleRemoved: (m) => {
    let item = hypercordScope.settings.items.find((x) => x[1] === hypercordScope.moduleStoreAPI.getSettingItemName(m))[2].find((x) => x.subtext === m.description);
    
    if (item === undefined) return;

    item.buttonType = 'brand';
    item.buttonText = hypercordScope.i18n.hypercordStrings.moduleStore.card.button.import;
    item.showToggle = false;

    // If themes / plugins open
    if (document.querySelector(`#gm-settings-inject`)) {
      const cardEls = [...document.querySelectorAll(`.title-31JmR4 + .colorStandard-2KCXvj`)].filter((x) => x.textContent === m.description).map((x) => x.parentElement);

      if (cardEls.length === 0) return;

      for (const cardEl of cardEls) {
        const buttonEl = cardEl.querySelector(`.colorRed-1TFJan`);

        buttonEl.className = buttonEl.className.replace('lookOutlined-3sRXeN colorRed-1TFJan', 'lookFilled-1Gx00P colorBrand-3pXr91');
        buttonEl.textContent = hypercordScope.i18n.hypercordStrings.moduleStore.card.button.import;

        const toggleEl = cardEl.querySelector(`.container-3auIfb`);
        toggleEl.classList.add('hide-toggle');
      }
    }
  },

  parseAuthors: async (a) => {
    let authors = [];

    if (typeof a === "string") {
      authors = a.split(', ');
    } else if (Array.isArray(a)) {
      authors = a;
    };
    
    return (await Promise.all(authors.map(async (x, i) => {
      if (typeof x === 'object') { // User object
        const pfp = `<img style="display: inline; border-radius: 50%; margin-right: 5px; vertical-align: bottom;" src="https://cdn.discordapp.com/avatars/${x.i}/${x.a}.png?size=32">`;
        const name = `<span class="author" style="cursor: pointer; line-height: 32px;" onmouseover="this.style.color = '#ccc'" onmouseout="this.style.color = '#fff'" onclick="try { window.hypercord.webpackModules.findByProps('open', 'fetchMutualFriends').open('${x.i}') } catch (e) { }">${x.n}</span>`; //<span class="description-3_Ncsb">#${result.discriminator}</span></span>`;

        return i > 1 ? pfp : pfp + name;
      }

      if (x.match(/^[0-9]{17,18}$/)) { // "<id>"
        const result = await IDCache.getDataForID(x);

        const pfp = `<img style="display: inline; border-radius: 50%; margin-right: 5px; vertical-align: bottom;" src="https://cdn.discordapp.com/avatars/${result.id}/${result.avatar}.png?size=32">`;
        const name = `<span class="author" style="cursor: pointer; line-height: 32px;" onmouseover="this.style.color = '#ccc'" onmouseout="this.style.color = '#fff'" onclick="try { window.hypercord.webpackModules.findByProps('open', 'fetchMutualFriends').open('${result.id}') } catch (e) { }">${result.username}</span>`; //<span class="description-3_Ncsb">#${result.discriminator}</span></span>`;

        return i > 1 ? pfp : pfp + name;
      }

      let idMatch = x.match(/(.*) \(([0-9]{17,18})\)/); // "<name> (<id>)"
      if (idMatch === null) return `<span class="author">${x}</span>`; // "<name>"

      return `<span class="author" style="cursor: pointer;" onmouseover="this.style.color = '#ccc'" onmouseout="this.style.color = '#fff'" onclick="try { window.hypercord.webpackModules.findByProps('open', 'fetchMutualFriends').open('${idMatch[2]}') } catch (e) { }">${idMatch[1]}</span>`; // todo
    }))).join('<span class="description-3_Ncsb">,</span> ');
  },

  updateStoreSetting: async () => {
    let allItems = hypercordScope.settings.items.filter((x) => x[1] === hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins || x[1] === hypercordScope.i18n.hypercordStrings.settings.itemNames.themes);

    for (const i of allItems) {
      i[2] = i[2].filter((x) => x.type !== 'card');
    }

    for (const m of hypercordScope.moduleStoreAPI.modules) {
      const itemName = hypercordScope.moduleStoreAPI.getSettingItemName(m);
      const item = allItems.find((x) => x[1] === itemName);

      const type = m.tags.includes('theme') ? 'themes' : 'plugins';

      item[2].push({
        type: 'card',
        
        tags: m.tags,
        github: m.github,
        images: m.images?.map((x) => {
          if (x.startsWith('/')) {
            const baseUrl = m.repo.split('/').slice(0, -1).join('/');
            x = baseUrl + x;
          }

          return x;
        }),
        lastUpdated: m.lastUpdated,

        buttonType: hypercordScope.modules[m.name] || hypercordScope.disabledModules[m.name] ? 'danger' : 'brand',
        showToggle: hypercordScope.modules[m.name] || hypercordScope.disabledModules[m.name],

        name: m.name,
        author: await hypercordScope.moduleStoreAPI.parseAuthors(m.authors),

        subtext: m.description,
        subtext2: m.version === '0' || m.version.toLowerCase().includes('auto') ? '' : `v${m.version}`,

        buttonText: hypercordScope.modules[m.name] || hypercordScope.disabledModules[m.name] ? hypercordScope.i18n.discordStrings.REMOVE : hypercordScope.i18n.hypercordStrings.moduleStore.card.button.import,
        onclick: async () => {
          hypercordScope.settings[`regen${type}`] = true;

          if (hypercordScope.modules[m.name] || hypercordScope.disabledModules[m.name]) {
            // el.textContent = hypercordScope.i18n.hypercordStrings.moduleStore.card.button.removing;

            hypercordScope.settings.removeModuleUI(m.name, itemName);

            return;
          }

          // el.textContent = hypercordScope.i18n.hypercordStrings.moduleStore.card.button.importing;

          if (m.dependencies && m.dependencies.length > 0) { // If it's the initial (on import) import that means it has been imported before
            const mainWord = m.dependencies.length === 1 ? 'dependency' : 'dependencies';

            const toContinue = await hypercord.confirmDialog('Continue',
              `${m.name} has ${m.dependencies.length === 1 ? 'a ' : ''}${mainWord}`,
              `**${m.name}** has **${m.dependencies.length}** ${mainWord}:
${m.dependencies.map((x) => ` - **${x}**\n`)}
To continue importing this module the dependencies need to be imported.`,
              undefined,
              'brand');

            if (!toContinue) return;

            for (const d of m.dependencies) {
              await hypercordScope.moduleStoreAPI.importModule(d);
            }
          }

          await hypercordScope.moduleStoreAPI.importModule(m.name);
        },
        isToggled: () => hypercordScope.disabledModules[m.name] === undefined,
        onToggle: async (checked) => {
          if (hypercordScope.settings.ignoreVisualToggle) {
            delete hypercordScope.settings.ignoreVisualToggle;
            return;
          }

          hypercordScope.settings[`regen${type}`] = true;

          if (checked) {
            hypercordScope.modules[m.name] = Object.assign({}, hypercordScope.disabledModules[m.name]);
            delete hypercordScope.disabledModules[m.name];

            await hypercordScope.modules[m.name].hypercordHandlers.onImport();

            if (hypercordScope.modules[m.name].hypercordHandlers.onLoadingFinished !== undefined) {
              await hypercordScope.modules[m.name].hypercordHandlers.onLoadingFinished();
            }

            await hypercordScope.moduleSettingsStore.loadSavedModuleSetting(m.name);

            hypercordScope.moduleSettingsStore.enableModule(m.name);
          } else {
            hypercordScope.disabledModules[m.name] = Object.assign({}, hypercordScope.modules[m.name]);

            await hypercordScope.modules[m.name].hypercordHandlers.onRemove();

            delete hypercordScope.modules[m.name];

            hypercordScope.moduleSettingsStore.disableModule(m.name);
          }

          // If themes / plugins open
          if (document.querySelector(`#gm-settings-inject`)) {
            const cardEls = [...document.querySelectorAll(`.title-31JmR4 + .colorStandard-2KCXvj`)].filter((x) => x.textContent === m.description).map((x) => x.parentElement);

            if (cardEls.length === 0) return;

            for (const cardEl of cardEls) {
              hypercordScope.settings.ignoreVisualToggle = true;

              const toggleInputEl = cardEl.querySelector('.input-rwLH4i');
              toggleInputEl.click();
            }
          }
        }
      });
    }
  },

  verifyPgp: async (repo) => {
    // if (useCache && Date.now() < repo.pgp?.when + (1000 * 60 * 60 * 24)) return repo.pgp.result; // If trying to verify and already cache in last day, return cache

    const setInRepo = (result) => { // Return wrapper also setting value in repo object to cache
      const pgpObj = {
        result,
        trustState: result !== 'verified' && repo.oncePgp || (result === 'invalid_signature' || result === 'no_signature') ? 'untrusted' : (result === 'verified' ? 'trusted' : 'unknown'),
        when: Date.now()
      };

      const storedRepo = hypercordScope.moduleStoreAPI.repos.find((x) => x.url === repo.url);
      if (!storedRepo) return pgpObj;

      storedRepo.pgp = pgpObj;

      if (result === 'verified') storedRepo.oncePgp = true; // Mark repo as once having PGP as if it doesn't in future it should be flagged

      hypercord.logger.debug('pgp.save', storedRepo);

      hypercord.storage.set('hypercordRepos', JSON.stringify(hypercordScope.moduleStoreAPI.repos));

      return storedRepo.pgp;
    };

    hypercord.logger.debug('pgp', 'verifying repo:', repo.meta.name);

    const get = async (url) => {
      const req = await fetch(url + '?_=' + Date.now()); // Add query to prevent caching

      if (!req.ok) return false;

      return await req.text();
    };

    const publicKey = await get(`https://hypercord.github.io/Keyserver/repos/${repo.meta.name}.gpg`);
    if (!publicKey) {
      hypercord.logger.debug('pgp', 'no public key, aborting');
      return setInRepo('no_public_key');
    }

    const signature = await get(repo.url + '.sig');
    if (!signature) {
      hypercord.logger.debug('pgp', 'no signature, aborting');
      return setInRepo('no_signature');
    }

    const original = repo.resp || await get(repo.url);

    return setInRepo(await verifySignature(publicKey, signature, original) ? 'verified' : 'invalid_signature');
  },
};