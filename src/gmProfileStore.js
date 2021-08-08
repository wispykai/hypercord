import Card from './ui/settings/items/card';
import sleep from './util/sleep';

export default () => {
  const { React, ReactDOM } = hypercord.webpackModules.common;
    
  const UserProfileModal = hypercord.webpackModules.find((x) => x.default?.displayName === 'UserProfileModal');

  const ScrollerClasses = hypercord.webpackModules.findByProps('auto', 'scrollerBase');

  hypercord.patcher.patch(UserProfileModal, 'default', (_args, res) => {
    const UserProfileTabBar = hypercord.reactUtils.findInReactTree(res.props.children, (x) => x.props?.section);
    if (!UserProfileTabBar) return;
    
    hypercord.patcher.patch(UserProfileTabBar, 'type', ([ { user: { id } } ], res) => {
      const modules = hypercord.moduleStoreAPI.modules.filter((x) => x.authors.some && x.authors.some((x) => x.i === id));

      if (modules.length === 0) return;
      
      const themesItem = hypercord.settings.items.find((x) => x[1] === hypercord.i18n.hypercordStrings.settings.itemNames.themes)[2];
      const pluginsItem = hypercord.settings.items.find((x) => x[1] === hypercord.i18n.hypercordStrings.settings.itemNames.plugins)[2];
      
      const themes = modules.filter((x) => x.tags.includes('theme'));
      const plugins = modules.filter((x) => !x.tags.includes('theme'));
      
      
      const tabbar = res.props.children;
      const baseOff = tabbar.props.children[0];

      const makeCard = (module) => React.createElement(Card, {
        ...module,
        mini: true,

        onClick: async () => {
          document.querySelector('.backdrop-1wrmKB').click(); // Hide user profile modal

          const RoutingUtils = hypercord.webpackModules.findByProps('transitionTo');

          RoutingUtils.transitionTo('/channels/@me'); // Go to home

          await sleep(200);

          document.getElementById('gm-home-' + (module.tags.includes('theme') ? 'themes' : 'plugins')).click(); // Go to GM Store themes / plugins page

          await sleep(200);

          const cardEl = [...document.querySelectorAll(`.title-31JmR4 + .colorStandard-2KCXvj`)].filter((x) => x.textContent === module.subtext).pop().parentElement;

          document.querySelector('#gm-settings-inject').scrollTo({ top: cardEl.offsetTop - 12, behavior: 'smooth' }); // Scroll to card smoothly

          cardEl.style.boxShadow = '0 0 12px 6px rgb(88 101 242 / 30%)'; // Highlight with message highlight color (improve in future likely)
        }
      });
      
      hypercord.patcher.patch(tabbar.props, 'onItemSelect', ([ selected ]) => {
        if (!selected.startsWith('GM_')) return;
        
        setTimeout(() => {
          const target = document.querySelector(`.body-r6_QPy > :first-child`);
          
          ReactDOM.render(React.createElement('div', {
            className: [ScrollerClasses.auto, 'gm-modules-container'].join(' ')
          },
            ...themes.map((x) => themesItem.find((y) => y.name === x.name)).map((x) => makeCard(x)),
            ...plugins.map((x) => pluginsItem.find((y) => y.name === x.name)).map((x) => makeCard(x)),
          ), target);
        }, 1);
      });
      
      tabbar.props.children.push(React.cloneElement(baseOff, {
        id: 'GM_MODULES'
      }, 'hypercord Modules'));
      
      return res;
    });
  });
};