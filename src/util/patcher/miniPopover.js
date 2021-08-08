import * as PatcherBase from './base';
import { findInReactTree } from '../react';

let hypercordScope = {};

export const setThisScope = (scope) => {
  hypercordScope = scope;
};

export const patch = (tooltipText, imgSrc, clickHandler) => {
  const { React } = hypercordScope.webpackModules.common;
  const Tooltip = hypercordScope.webpackModules.findByDisplayName('Tooltip');
  const { icon: iconClass } = hypercordScope.webpackModules.findByProps('icon', 'isHeader');
  
  const MiniPopover = hypercordScope.webpackModules.find((m) => m.default && m.default.displayName === 'MiniPopover')
  
  return PatcherBase.patch(MiniPopover, 'default', (_args, res) => {
    const props = findInReactTree(res, (r) => r && r.message);
    if (!props) return res;

    res.props.children.unshift(
      React.createElement(Tooltip, {
        position: "top",
        text: tooltipText
      }, ({
        onMouseLeave,
        onMouseEnter
      }) =>
        React.createElement(MiniPopover.Button, {
          onClick: () => {
            clickHandler(props);
          },
          onMouseEnter,
          onMouseLeave
        },
          typeof imgSrc !== 'string' ? imgSrc : React.createElement("img", {
            src: imgSrc,
            width: "24px",
            height: "24px",
            className: iconClass
          })
        )
      )
    );

    return res;
  });
};