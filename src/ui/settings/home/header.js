import openReposModal from './repos';

export default () => {
const { React } = hypercord.webpackModules.common;

const HomeMiscClasses = hypercord.webpackModules.findByProps('headerBarContainer', 'pageContent');
const SpinClasses = hypercord.webpackModules.findByProps('updateAvailable');
const IconClasses = hypercord.webpackModules.findByProps('icon', 'iconBadge', 'title');

const UpdateIcon = React.createElement(hypercord.webpackModules.findByDisplayName('Retry'), {
  width: 24,
  height: 24,

  className: IconClasses.icon
});

const ReposIcon = React.createElement(hypercord.webpackModules.findByDisplayName('Cloud'), {
  width: 24,
  height: 24,

  className: IconClasses.icon
});

const HeaderBarContainer = hypercord.webpackModules.findByDisplayName('HeaderBarContainer');

const TabBar = hypercord.webpackModules.findByDisplayName('TabBar');
const TabBarClasses1 = hypercord.webpackModules.findByProps('topPill');
const TabBarClasses2 = hypercord.webpackModules.findByProps('tabBar', 'nowPlayingColumn')

const tabsSelected = {
  themes: 'STORE',
  plugins: 'STORE'
};


return class Header extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement(HeaderBarContainer, {
      className: HomeMiscClasses.headerBarContainer,

      isAuthenticated: true,
      transparent: false
    },

    React.createElement(HeaderBarContainer.Icon, {
      icon: () => this.props.icon,
      className: IconClasses.icon
    }),

    React.createElement(HeaderBarContainer.Title, {}, hypercord.i18n.hypercordStrings.settings.itemNames[this.props.title] || (this.props.title[0].toUpperCase() + this.props.title.substring(1))),

    tabsSelected[this.props.title] ? React.createElement(HeaderBarContainer.Divider) : null,

    tabsSelected[this.props.title] ? React.createElement(TabBar, {
      selectedItem: tabsSelected[this.props.title],

      type: TabBarClasses1.topPill,
      className: TabBarClasses2.tabBar,

      onItemSelect: (x) => {
        tabsSelected[this.props.title] = x;
        this.forceUpdate();

        setTimeout(hypercord.settings.updateModuleStoreUI, 10);
      }
    },
      React.createElement(TabBar.Item, {
        id: 'STORE',
        look: 0,
        
        className: TabBarClasses2.item
      }, 'Store'),
      React.createElement(TabBar.Item, {
        id: 'IMPORTED',
        look: 0,
        
        className: TabBarClasses2.item
      }, 'Imported'),
    ) : null,


    this.props.title !== 'snippets' ? React.createElement('div', {
      className: IconClasses.toolbar,

      style: {
        position: 'absolute',
        right: '0px'
      }
    },
      React.createElement(HeaderBarContainer.Icon, {
        icon: () => UpdateIcon,

        tooltip: hypercord.i18n.discordStrings.STAGE_DISCOVERY_REFRESH_ICON_LABEL,

        onClick: async () => {
          const svgEl = document.querySelector(`.${IconClasses.toolbar} > [role="button"] > svg`);
          svgEl.classList.add(SpinClasses.updateAvailable);

          await hypercord.moduleStoreAPI.hotupdate(true);

          document.querySelector(`.selected-aXhQR6`).click();
        }
      }),
      React.createElement(HeaderBarContainer.Icon, {
        icon: () => ReposIcon,

        tooltip: hypercord.i18n.hypercordStrings.moduleStore.repos.repos,

        onClick: openReposModal
      })
    ) : ''
    );
  }
}
};