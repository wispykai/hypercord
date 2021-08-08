import sleep from '../../util/sleep';


export let enabled = false;
export let todo = [
  'themes',
  'plugins'
];

export const done = (thing) => {
  todo.splice(todo.indexOf(thing), 1);
};

export const themes = async () => {
  const ModulesPreview = await import('./modulesPreview').default;

  const { React } = hypercord.webpackModules.common;

  // const RoutingUtils = hypercord.webpackModules.findByProps('transitionTo');

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  const possibleThemes = hypercord.moduleStoreAPI.modules.filter((x) => x.tags.includes('theme') && x.images && x.images[0]).sort((a, b) => b.github.stars - a.github.stars);
  const themeIndex = Math.floor(Math.random() * (possibleThemes.length - 5));

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'Themes',

    confirmText: 'Browse Themes',

    onConfirm: async () => {
      if (hypercord.ootb.todo.length === 0) {
        /* while (document.querySelector('#gm-home-themes').classList.contains('selected-aXhQR6')) {
          await sleep(100);
        } */

        await sleep(2000);

        hypercord.ootb.settings();
      }
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: possibleThemes.slice(themeIndex, themeIndex + 3)
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Beautify your Discord with Themes'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'Pick from over 100 themes to tweak and enhance your user interface')
    )
  });
};

export const plugins = async () => {
  const ModulesPreview = await import('./modulesPreview').default();

  const { React } = hypercord.webpackModules.common;

  // const RoutingUtils = hypercord.webpackModules.findByProps('transitionTo');

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  const possiblePlugins = hypercord.moduleStoreAPI.modules.filter((x) => !x.tags.includes('theme') && x.images && x.images[0]).sort((a, b) => b.github.stars - a.github.stars);
  const pluginIndex = Math.floor(Math.random() * (possiblePlugins.length - 5));

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'Plugins',

    confirmText: 'Browse Plugins',

    onConfirm: async () => {
      if (hypercord.ootb.todo.length === 0) {
        /* while (document.querySelector('#gm-home-plugins').classList.contains('selected-aXhQR6')) {
          await sleep(100);
        } */

        await sleep(2000);

        hypercord.ootb.settings();
      }
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: possiblePlugins.slice(pluginIndex, pluginIndex + 3)
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Amplify your Discord under the hood'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'Plugins augment your experience with improvements in the app itself')
    )
  });
};

export const store = async () => {
  const ModulesPreview = await import('./modulesPreview').default;

  const { React } = hypercord.webpackModules.common;

  const RoutingUtils = hypercord.webpackModules.findByProps('transitionTo');

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  const possibleModules = hypercord.moduleStoreAPI.modules.filter((x) => x.images && x.images[0]).sort((a, b) => b.github.stars - a.github.stars);
  const moduleIndex = Math.floor(Math.random() * (possibleModules.length - 5));

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'Store',

    confirmText: 'View Store in Home',

    onConfirm: async () => {
      RoutingUtils.transitionTo('/channels/@me'); // Go to home

      await sleep(100);
      
      document.body.classList.add('gm-highlight');

      await sleep(3000);

      document.body.classList.remove('gm-highlight');
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: possibleModules.slice(moduleIndex, moduleIndex + 3)
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Browse Themes and Plugins in the Store'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'hypercord uses it\'s own Store, where you can easily look around and install')
    )
  });
};

export const settings = async () => {
  const ModulesPreview = await import('./modulesPreview').default;

  const { React } = hypercord.webpackModules.common;

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'Settings',

    confirmText: 'View hypercord Settings',

    onConfirm: async () => {
      hypercord.settings.openSettings();

      await sleep(20);

      document.querySelector(`[aria-controls="gm-${hypercord.i18n.discordStrings.SETTINGS}-tab"]`).click(); // Open GM Settings page

      const scroller = document.querySelector(`.sidebarRegionScroller-3MXcoP`); // Scroll to bottom of Settings
      scroller.scrollTop = scroller.offsetHeight - 270;

      while (document.querySelector('.closeButton-1tv5uR')) {
        await sleep(100);
      }

      hypercord.ootb.community();
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: [
          {
            name: 'Experimental Features',
            description: 'Try out new experimental features'
          },

          {
            name: 'Utilities',
            description: 'Make backups, reset hypercord, and more'
          },

          {
            name: 'Tweaks',
            description: 'Tweak hypercord to how you want it'
          }
        ]
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Use hypercord\'s Settings to customise it\'s features'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'There are various options for you to change')
    )
  });
};

export const community = async () => {
  const ModulesPreview = await import('./modulesPreview').default;

  const { React } = hypercord.webpackModules.common;

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'Community',

    confirmText: 'Join hypercord Discord',

    onConfirm: () => {
      window.open('https://hypercord.com/discord');
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: [
          {
            name: 'Ask Questions',
            description: 'Ask any questions and get support'
          },

          {
            name: 'News',
            description: 'Get the latest news and announcements around hypercord and related projects'
          },

          {
            name: 'Get Involved',
            description: 'Help out with suggestions, supporting others, and more'
          }
        ]
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Join hypercord\'s Community'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'Join our Discord for further information and more')
    )
  });
};

export const start = async () => {
  const ModulesPreview = await import('./modulesPreview').default;

  const { React } = hypercord.webpackModules.common;

  const Header = hypercord.webpackModules.findByDisplayName('Header');
  const Text = hypercord.webpackModules.findByDisplayName('Text');

  hypercord.webpackModules.findByProps('show').show({
    className: 'gm-ootb-modal',

    title: 'hypercord',

    confirmText: 'Learn More',
    cancelText: 'Not Interested',

    onConfirm: () => {
      hypercord.ootb.enabled = true;

      hypercord.ootb.store();
    },

    body: React.createElement('div', {
      className: 'container-1rn8Cv'
    },
      React.createElement(ModulesPreview, {
        modules: [
          {
            name: 'Store',
            description: 'Learn about hypercord\'s Store and what\'s in it'
          },

          {
            name: 'Settings',
            description: 'Find out about the settings for hypercord and plugins'
          },

          {
            name: 'Community',
            description: 'Join our Discord to ask questions, give feedback, keep up to date with news, and more'
          }
        ]
      }),

      React.createElement(Header, {
        className: "header-2MiVco",

        size: Header.Sizes.SIZE_24
      }, 'Learn about hypercord'),

      React.createElement(Text, {
        className: "byline-3REiHf",

        size: Text.Sizes.SIZE_16,
        color: Text.Colors.HEADER_SECONDARY
      }, 'Go through a short tour through hypercord\'s core functions')
    )
  });
};