export default async (hypercordScope) => {
  const { React, ReactDOM } = hypercordScope.webpackModules.common;

  const ConnectedPrivateChannelsList = hypercordScope.webpackModules.find((x) => x.default && x.default.displayName === 'ConnectedPrivateChannelsList');

  const ListSectionItem = hypercordScope.webpackModules.findByDisplayName('ListSectionItem');
  const { LinkButton } = hypercordScope.webpackModules.findByProps('LinkButton');

  const LinkButtonClasses = hypercordScope.webpackModules.findByProps('selected', 'wrappedName');
  const ChannelLinkButtonClasses = hypercordScope.webpackModules.findByProps('channel', 'linkButtonIcon');
  const HeaderClasses = hypercordScope.webpackModules.findByProps('headerText', 'privateChannelsHeaderContainer');
  const IconClasses = hypercordScope.webpackModules.findByProps('icon', 'iconBadge', 'title');
  const ScrollerClasses = hypercordScope.webpackModules.findByProps('scrollerBase', 'auto');

  const homeIcons = {
    themes: React.createElement(hypercordScope.webpackModules.findByDisplayName('Eye'), {
      width: 24,
      height: 24
    }),

    plugins: React.createElement(hypercordScope.webpackModules.findByDisplayName('InlineCode'), {
      width: 24,
      height: 24
    }),

    snippets: React.createElement(hypercordScope.webpackModules.findByDisplayName('Pictures'), {
      width: 24,
      height: 24
    }),

    expandable: React.createElement(hypercord.webpackModules.findByDisplayName('DropdownArrow'), {
      className: `${IconClasses.icon}`,

      width: 24,
      height: 24
    })
  };

  const Header = (await import('./header')).default();

  const LoadingPopout = hypercordScope.webpackModules.findByDisplayName('LoadingPopout');

  const makeHeader = (icon, title) => React.createElement(Header, {
    icon,
    title
  });

  const makeContent = (isLibrary, content) => React.createElement('div', {
    className: !isLibrary ? `${ScrollerClasses.auto}` : '',
    id: 'gm-settings-inject',

    style: {
      padding: '22px',
      backgroundColor: 'var(--background-primary)',

      height: '100%',
      overflow: !isLibrary ? 'hidden scroll' : ''
    }
  }, content);

  const makePage = (icon, title, content) => React.createElement('div', {
    style: {
      height: '100%',
      overflow: 'hidden'
    }
  },
    makeHeader(icon, title),

    makeContent(false, content)
  );

  const RoutingUtils = hypercordScope.webpackModules.findByProps('transitionTo');

  const findClassInParentTree = (el, className, depth = 0) => {
    if (depth > 5) return false;

    const parentEl = el.parentElement;
    return (parentEl.classList.contains(className) && parentEl) || findClassInParentTree(parentEl, className, depth + 1);
  };

  let expanded = hypercord.storage.get('hypercordHomeExpanded') || true;

  let settings = {
    plugins: hypercordScope.settings.items.find((x) => x[1] === hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins),
    themes: hypercordScope.settings.items.find((x) => x[1] === hypercordScope.i18n.hypercordStrings.settings.itemNames.themes),
    snippets: hypercordScope.settings.items.find((x) => x[1] === 'Snippets')
  };

  let contents = {
    plugins: hypercordScope.settings._createItem(settings.plugins[1], settings.plugins[2], false),
    themes: hypercordScope.settings._createItem(settings.themes[1], settings.themes[2], false),
    snippets: hypercordScope.settings._createItem(settings.snippets[1], settings.snippets[2], false)
  };

  const handleItemClick = (type) => {
    const parentEl = [...document.querySelector(`.content-98HsJk`).children].find((x, i) => i !== 0 && !x.classList.contains('erd_scroll_detection_container'));

    [...document.querySelector(`.scroller-1JbKMe`).children[0].children].forEach((x) => x.className = x.className?.replace(LinkButtonClasses.selected, LinkButtonClasses.clickable));

    setTimeout(() => {
      const buttonEl = document.getElementById(`gm-home-${type}`);
      buttonEl.className = buttonEl.className.replace(LinkButtonClasses.clickable, LinkButtonClasses.selected);
    }, 0);

    const contentCards = type !== 'snippets' && Array.isArray(contents[type].props.children) ? contents[type].props.children.filter((x) => x.props.type === 'card').length : 0;
    const expectedModuleCount = type !== 'snippets' ? hypercordScope.moduleStoreAPI.modules.filter((x) => type === 'plugins' ? !x.tags.includes('theme') : x.tags.includes('theme')).length : 0;

    if (contentCards !== expectedModuleCount || hypercordScope.settings[`regen${type}`]) { // If amount of cards in generated React content isn't the same as amount of modules in Store
      delete hypercordScope.settings[`regen${type}`];

      contents[type] = React.createElement('div', { // Show loading indicator whilst wait
        className: 'gm-store-loading-container'
      },
        React.createElement(LoadingPopout)
      );

      (async () => {
        if (type !== 'snippets' && settings[type][2].filter((x) => x.type === 'card').length !== expectedModuleCount) { // Update store settings if card counts mismatch
          await hypercordScope.moduleStoreAPI.updateStoreSetting();
        }

        contents[type] = hypercordScope.settings._createItem(settings[type][1], settings[type][2], false); // Generate React content

        document.querySelector(`#gm-home-${type}`).click();
      })();
    }


    if (parentEl.children.length === 1) {
      ReactDOM.render(makePage(homeIcons[type], type, contents[type]), parentEl.children[0]);
    }
    
    if (parentEl.children.length === 2 || parentEl.children.length === 3) {
      let indexOffset = parentEl.children.length - 2;

      // Library has jank scroll elements so implement edge case
      const isLibrary = parentEl.children[indexOffset + 1].classList.contains('stickyScroller-24zUyY');
      if (isLibrary) indexOffset = 0;

      parentEl.children[indexOffset + 0].className = '';
      ReactDOM.render(makeHeader(homeIcons[type], type), parentEl.children[indexOffset + 0]);
      
      if (indexOffset !== 0 && parentEl.children[indexOffset + 1].children[1]) {
        parentEl.children[indexOffset + 1].children[1].style.display = 'none';
      }

      if (isLibrary) indexOffset = 1;

      ReactDOM.render(makeContent(isLibrary, contents[type]), indexOffset !== 0 ? parentEl.children[indexOffset + 1].children[0] : parentEl.children[indexOffset + 1]);
    }

    if (hypercordScope.ootb.enabled && hypercordScope.ootb.todo.includes(type)) {
      hypercordScope.ootb[type]();

      hypercordScope.ootb.done(type);
    }
  };
  
  const snippetsEnabled = hypercordScope.settings.gmSettings.get().snippets;

  hypercordScope.settingsUninjects.push(hypercordScope.patcher.patch(ConnectedPrivateChannelsList, 'default', (_args, res) => {
    if (res.props.children.slice(3).find((x) => x?.toString()?.includes('hypercord'))) return;

    setTimeout(() => {
      document.querySelector(`.scroller-1JbKMe`).addEventListener('click', (e) => {
        const buttonEl = findClassInParentTree(e.target, ChannelLinkButtonClasses.channel);
        if (buttonEl && !buttonEl.id.startsWith('gm-home-')) {
          document.querySelectorAll('[id^="gm-home-"]').forEach((x) => x.className = x.className.replace(LinkButtonClasses.selected, LinkButtonClasses.clickable)); 

          setTimeout(() => {
            if (document.getElementById(`gm-settings-inject`) !== null) {
              RoutingUtils.transitionTo('/invalid');
              RoutingUtils.back();
            }
          }, 1);
        }
      });
    }, 10);

    res.props.children.push(
    () => React.createElement(ListSectionItem, {
      className: HeaderClasses.privateChannelsHeaderContainer
    },
      React.createElement('span', {
        className: HeaderClasses.headerText
      }, 'hypercord'),

      React.createElement('div', {
        className: `${HeaderClasses.privateChannelRecipientsInviteButtonIcon} ${IconClasses.iconWrapper} ${IconClasses.clickable}`,

        style: {
          transform: `rotate(${expanded ? '0' : '-90'}deg)`,
          width: '22px',

          left: expanded ? '0px' : '-2px',
          top: expanded ? '-6px' : '-2px'
        },

        onClick: () => {
          expanded = !expanded;
          hypercord.storage.set('hypercordHomeExpanded', expanded);

          // Force update sidebar (jank DOM way)
          document.querySelector(`.scroller-1JbKMe`).dispatchEvent(new Event('focusin'));
          document.querySelector(`.scroller-1JbKMe`).dispatchEvent(new Event('focusout'));
        }
      },
        homeIcons.expandable
      )
    ),

    () => React.createElement(LinkButton, {
      style: {
        display: expanded || document.querySelector('.title-29uC1r')?.textContent === hypercordScope.i18n.hypercordStrings.settings.itemNames.themes ? 'block' : 'none'
      },

      icon: () => homeIcons.themes,
      onClick: () => handleItemClick('themes'),

      id: 'gm-home-themes',

      text: hypercordScope.i18n.hypercordStrings.settings.itemNames.themes,

      selected: false
    }),

    () => React.createElement(LinkButton, {
      style: {
        display: expanded || document.querySelector('.title-29uC1r')?.textContent === hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins ? 'block' : 'none'
      },

      icon: () => homeIcons.plugins,
      onClick: () => handleItemClick('plugins'),

      id: 'gm-home-plugins',

      text: hypercordScope.i18n.hypercordStrings.settings.itemNames.plugins,

      selected: false
    }),

    snippetsEnabled ? () => React.createElement(LinkButton, {
      style: {
        display: expanded || document.querySelector('.title-29uC1r')?.textContent === 'Snippets' ? 'block' : 'none'
      },

      icon: () => homeIcons.snippets,
      onClick: () => handleItemClick('snippets'),

      id: 'gm-home-snippets',

      text: 'Snippets',

      selected: false
    }) : null
    );
  }));

  // If home currently open, force update sidebar via routing
  if (document.querySelector(`.privateChannels-1nO12o`)) {
    RoutingUtils.transitionTo('/invalid');
    RoutingUtils.back();
  }

  (async () => { // Pre-generate contents with cached modules
    // Make store setting with cached modules whilst waiting for hotupdate from repos
    await hypercordScope.moduleStoreAPI.updateStoreSetting();

    const snippetsLoaded = (JSON.parse(hypercord.storage.get('hypercordSnippets')) || {});

    for (const id in snippetsLoaded) {
      const css = snippetsLoaded[id];

      snippetsLoaded[id] = document.createElement('style');

      snippetsLoaded[id].appendChild(document.createTextNode(css));

      document.body.appendChild(snippetsLoaded[id]);
    }

    const snippetsLoad = async (channelId, label) => {
      const { fetchMessages } = hypercordScope.webpackModules.findByProps('fetchMessages');
      const { getRawMessages } = hypercordScope.webpackModules.findByProps('getMessages');
      const { getChannel, hasChannel } = hypercordScope.webpackModules.findByProps('getChannel');
  
      if (!hasChannel(channelId)) return;

      await fetchMessages({ channelId: channelId }); // Load messages
  
      const channel = getChannel(channelId);
      const messages = Object.values(getRawMessages(channelId))
        .filter((x) => x.content.includes('\`\`\`css') && // Make sure it has CSS codeblock
          !x.message_reference && // Exclude replies
          !x.content.includes('quick CSS') && // Exclude PC / BD specific snippets
          !x.content.includes('Theme Toggler')
        ).sort((a, b) => (b.attachments.length + b.embeds.length) - (a.attachments.length + a.embeds.length)); // Bias to favour images so we can have previews first
  
      const settingItem = hypercordScope.settings.items.find((x) => x[1] === 'Snippets');
  
      settingItem[2].push(
        {
          type: 'store-header',
          text: label
        },
        ...messages.map((x) => ({
          type: 'card',
  
          tags: [ x.id ],
          lastUpdated: 0,

          discordMessage: {
            guild: channel.guild_id,
            channel: channel.id,
            message: x.id
          },
  
          images: x.attachments[0] ? [ x.attachments[0].proxy_url ] : (x.embeds[0] ? [ x.embeds[0].thumbnail.proxy_url ] : []),
  
          name: '', // No name makes subtext main content (not gray)
          author: `<img style="display: inline; border-radius: 50%; margin-right: 5px; vertical-align: bottom;" src="https://cdn.discordapp.com/avatars/${x.author.id}/${x.author.avatar}.png?size=32"><span class="author" style="line-height: 32px;">${x.author.username}</span>`, // Based off Store author generation
  
          subtext: x.content.replace(/```css(.*)```/gs, ''), // Only context / text without code
  
          buttonText: snippetsLoaded[x.id] ? hypercordScope.i18n.discordStrings.REMOVE : hypercordScope.i18n.discordStrings.ADD,
          buttonType: snippetsLoaded[x.id] ? 'danger' : 'brand',

          onclick: () => {
            const cardSet = settingItem[2].find((y) => y.tags?.includes(x.id));
            const cardEl = document.querySelector(`[class*="${x.id}"]`);
            const buttonEl = cardEl.querySelector(`button`);
  
            hypercordScope.settings.regensnippets = true;

            if (snippetsLoaded[x.id]) { // Remove
              snippetsLoaded[x.id].remove();

              delete snippetsLoaded[x.id];

              buttonEl.className = buttonEl.className.replace('lookOutlined-3sRXeN colorRed-1TFJan', 'lookFilled-1Gx00P colorBrand-3pXr91');
              buttonEl.textContent = hypercordScope.i18n.discordStrings.ADD;

              cardSet.buttonText = hypercordScope.i18n.discordStrings.ADD;
              cardSet.buttonType = 'brand';
            } else { // Add
              snippetsLoaded[x.id] = document.createElement('style');

              snippetsLoaded[x.id].appendChild(document.createTextNode(/```css(.*)```/s.exec(x.content)[1]));

              document.body.appendChild(snippetsLoaded[x.id]);

              buttonEl.className = buttonEl.className.replace('lookFilled-1Gx00P colorBrand-3pXr91', 'lookOutlined-3sRXeN colorRed-1TFJan');
              buttonEl.textContent = hypercordScope.i18n.discordStrings.REMOVE;

              cardSet.buttonText = hypercordScope.i18n.discordStrings.REMOVE;
              cardSet.buttonType = 'danger';
            }

            const toSave = Object.assign({}, snippetsLoaded);

            for (const id in toSave) {
              toSave[id] = toSave[id].textContent;
            }

            hypercord.storage.set('hypercordSnippets', JSON.stringify(toSave));
          },

          showToggle: false, // No toggling snippets as overcomplex for small snippets
          isToggled: () => false
        }))
      );
    };

    await snippetsLoad('755005803303403570', 'Powercord CSS Snippets');
    await snippetsLoad('836694789898109009', 'BetterDiscord CSS Snippets');
    await snippetsLoad('449569809613717518', 'Black Box CSS Snippets');


    for (const type of ['themes', 'plugins', 'snippets']) {
      contents[type] = hypercordScope.settings._createItem(settings[type][1], settings[type][2], false); // Generate React contents
    }
  })();
};