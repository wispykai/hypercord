let hypercordScope = {};
let unpatchers = [];

let cssEl;

export const setThisScope = (scope) => {
  hypercordScope = scope;

  cssEl = document.createElement('style');

  cssEl.textContent = `
/* Custom title replacing "Server Boost" */
#gm-sponsor-modal .headerTitle-1_9Kor {
  background-image: url(https://hypercord.com/img/goose_gold.jpg);

  background-repeat: no-repeat;
  background-size: contain;
  background-position: 50%;

  border-radius: 50%;

  height: 60px;
}

#gm-sponsor-modal .headerTitle-1_9Kor::after {
  font-family: var(--font-display);
  font-size: 24px;

  color: var(--text-normal);

  width: 140px;
  display: block;

  margin-left: 70px;
  margin-top: 6px;

  content: 'hypercord Sponsor';
}

#gm-sponsor-modal .guildBackground-3UtSZ2 > svg:first-child { /* Hide Lottie hands animation */
  display: none;
}

#gm-sponsor-modal .contentWrapper-3INYJy {
  padding: 16px;
  padding-right: 8px;
}

#gm-sponsor-modal .contentWrapper-3INYJy > div > div:not(:last-child) {
  margin-bottom: 32px;
}

#gm-sponsor-modal .contentWrapper-3INYJy > div > .footer-2gL1pp {
  left: -16px;
  top: 16px;
  width: calc(100% - 8px);
}

#gm-sponsor-modal .contentWrapper-3INYJy > div > div:first-child {
  font-family: var(--font-primary);
  font-size: 16px;
  line-height: 20px;

  color: var(--text-normal);
}`;
};

const showSponsorModal = () => {
  const { React } = hypercordScope.webpackModules.common;

  const PremiumFeaturesList = hypercordScope.webpackModules.findByDisplayName('PremiumFeaturesList');
  const FeaturesClasses = hypercordScope.webpackModules.findByProps('roleIcon', 'profileBadgeIcon');
  const PersonShield = hypercordScope.webpackModules.findByDisplayName('PersonShield');

  const ModalComponents = hypercordScope.webpackModules.findByProps('ModalFooter');

  const { Button } = hypercordScope.webpackModules.findByPropsAll('Button')[1];
  const ButtonClasses = hypercordScope.webpackModules.findByProps('button', 'colorRed');

  const { PremiumGuildSubscriptionPurchaseModal } = hypercordScope.webpackModules.findByProps('PremiumGuildSubscriptionPurchaseModal');

  const parent = { default: PremiumGuildSubscriptionPurchaseModal };

  const makeIcon = (className, child = '') => (() => React.createElement('div', {
    style: {
      flexShrink: '0',
      marginRight: '10px',

      width: '24px',
      height: '24px'
    },

    className: FeaturesClasses[className]
  }, child));

  hypercordScope.patcher.patch(parent, 'default', ([ { onClose } ], res) => {
    res.props.id = 'gm-sponsor-modal';

    res.props.children[1].props.children = [];

    res.props.children[1].props.children.unshift(
      React.createElement('div', {
        
        },

        React.createElement('div', {}, `You can sponsor (donate regularly or one-time) hypercord to help support it's development.`),

        React.createElement(PremiumFeaturesList, {
          columns: 2,
          features: [
            {
              description: 'Sponsor badge in hypercord',
              overrideIcon: makeIcon('profileBadgeIcon')
            },
            {
              description: 'Sponsor role in GooseNest Discord',
              overrideIcon: makeIcon('roleIcon', React.createElement(PersonShield, { width: '24px', height: '24px' }))
            }
          ]
        }),

        React.createElement(ModalComponents.ModalFooter, {

          },

          React.createElement(Button, {
            color: ButtonClasses.colorBrand,

            type: 'submit',

            onClick: () => {
              window.open('https://github.com/sponsors/CanadaHonk'); // Open GitHub Sponsors link in user's browser

              onClose();
            }
          }, 'Sponsor'),

          React.createElement(Button, {
            color: ButtonClasses.colorPrimary,
            look: ButtonClasses.lookLink,

            type: 'button',

            onClick: () => {
              onClose();
            }
          }, 'Close')
        )
      )
    )

    return res;
  });

  const { openModal } = hypercordScope.webpackModules.findByProps('openModal');

  openModal((e) => React.createElement(parent.default, { ...e }));
};

const badgeUsers = {
  sponsor: [ // People sponsoring (donating money) to hypercord / Ducko
    '506482395269169153', // Ducko
    '597905003717459968', // creatable
    '405400327370571786', // Chix
    '707309693449535599', // Armagan
    '302734867425132545', // hax4dayz
    '557429876618166283', // sourTaste000
    '250353310698176522', // p.marg
    '301088721984552961', // overheremedia / jakefaith
    '700698485560705084', // debugproto
    '274209973196816385', // quagsirus
    '274926795285987328', // Apollo
    '293094733159333889', // b1sergiu
    '202740603790819328', // Snow Fox / Lisa
    '541210648982585354', // Heli / heli_is_for_noob
  ],

  dev: [ // People actively developing hypercord itself
    '506482395269169153', // Ducko
  ],

  translator: [ // People who have translated hypercord to other languages
    '506482395269169153', // Ducko
    '394579914860396565', // C4Phoenix
    '787017887877169173', // Dziurwa
    '274213297316691968', // EnderXH
    '500656746440949761', // PandaDriver
    '326359466171826176', // sanana the skenana
    '396360155480064003', // Skree
    '169175121037099008', // TechnoJo4
    '189079074054995969', // xirreal
    '302734867425132545', // hax4dayz
    '172866400900218881', // Komodo
    '751092600890458203', // Pukima
    '266001128318042113', // maikirakiwi
  ]
};

export const addBadges = () => {
  document.head.appendChild(cssEl);

  unpatchers.push(
    // User badges
    hypercordScope.patcher.userBadges.patch('hypercord Sponsor',
      'https://files.catbox.moe/jzb4v2.png',

      // Force check via query because Discord not properly rerendering
      () => hypercordScope.settings.gmSettings.get().gmBadges ? badgeUsers.sponsor : [],

      () => {
        showSponsorModal();
      },

      { round: true }
    ),

    hypercordScope.patcher.userBadges.patch('hypercord Translator',
      'https://files.catbox.moe/jzb4v2.png',

      // Force check via query because Discord not properly rerendering
      () => hypercordScope.settings.gmSettings.get().gmBadges ? badgeUsers.translator : [],

      () => {
        
      },

      { round: true }
    ),

    hypercordScope.patcher.userBadges.patch('hypercord Developer',
      'https://files.catbox.moe/jzb4v2.png',

      // Force check via query because Discord not properly rerendering
      () => hypercordScope.settings.gmSettings.get().gmBadges ? badgeUsers.dev : [],

      () => {
        
      },

      { round: true }
    ),

    // Guild badges
    hypercord.patcher.guildBadges.patch('hypercord Official Discord',
      'https://files.catbox.moe/jzb4v2.png',
    
      // Force check via query because Discord not properly rerendering
      () => hypercordScope.settings.gmSettings.get().gmBadges ? ['756146058320674998'] : [],
    
      () => {

      },
    
      { round: true }
    )
  );
};

export const removeBadges = () => {
  for (const unpatch of unpatchers) {
    unpatch();
  }

  cssEl.remove();
};