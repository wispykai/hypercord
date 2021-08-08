let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const patch = () => {
  const { React } = hypercordScope.webpackModules.common;

  const Avatar = hypercordScope.webpackModules.findByProps('Sizes', 'AnimatedAvatar');

  hypercordScope.patcher.patch(Avatar, 'default', ([ { src } ], res) => {
    if (!src.includes('/avatars')) return;

    res.props['data-user-id'] = src.match(/\/avatars\/([0-9]+)\//)[1];

    return res;
  });

  // Patch AnimatedAvatar to force rerender
  hypercordScope.patcher.patch(Avatar.AnimatedAvatar, 'type', (_args, res) => {
    return React.createElement(Avatar.default, { ...res.props });
  });
};