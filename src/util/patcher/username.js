import * as PatcherBase from './base';

let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const patch = (generateElement) => {
  const MessageHeader = hypercordScope.webpackModules.find((x) => x.default && !x.default.displayName && x.default.toString().indexOf('headerText') > -1);

  return PatcherBase.patch(MessageHeader, 'default', (_args, res) => {
    const header = hypercord.reactUtils.findInReactTree(res, el => Array.isArray(el?.props?.children) && el.props.children.find(c => c?.props?.message));

    header.props.children.push(generateElement(header.props.children[0].props));

    return res;
  });
};
