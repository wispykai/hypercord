import * as PatcherBase from './base';

import { getOwnerInstance } from '../react';
import sleep from '../sleep';

export let notices = [];

let hypercordScope = {};

let updateCall;

export const setThisScope = async (scope) => {
  hypercordScope = scope;

  const BaseClasses = hypercordScope.webpackModules.findByProps('base', 'sidebar');

  while (document.getElementsByClassName(BaseClasses.base)[0] === undefined) {
    await sleep(10);
  }
  
  const baseOwnerInstance = getOwnerInstance(document.getElementsByClassName(BaseClasses.base)[0]);

  const { React } = hypercordScope.webpackModules.common;

  class NoticeContainer extends React.PureComponent {
    constructor (props) {
      super(props);


      this._updateCall = () => this.forceUpdate();
    }
  
    componentDidMount () {
      updateCall = this._updateCall;
    }
  
    componentWillUnmount () {
    }
  
    render () {
      return notices.length > 0 ? notices.shift().react : null;
    }
  }

  PatcherBase.patch(baseOwnerInstance.props.children, 'type', (_args, ret) => {
    ret.props.children[1].props.children.props.children.unshift(React.createElement(NoticeContainer));

    return ret;
  });

  baseOwnerInstance.forceUpdate();
};


export const patch = (content, buttonText, clickHandler, colorKey = 'brand') => {
  const NoticeColors = hypercordScope.webpackModules.findByProps('colorDanger', 'notice');
  const color = NoticeColors[`color${colorKey[0].toUpperCase() + colorKey.substring(1).toLowerCase()}`];

  const Notice = hypercordScope.webpackModules.findByProps('NoticeCloseButton', 'NoticeButton');

  const { React } = hypercordScope.webpackModules.common;

  const id = PatcherBase.generateId();

  const el = React.createElement(Notice.default, {
      class: 'hypercord-notice',
      id,
      color
    },

    React.createElement(Notice.NoticeCloseButton, {
      onClick: () => {
        notices = notices.filter((x) => x.id !== id);

        updateCall();
      }
    }),

    content,

    React.createElement(Notice.NoticeButton, {
      onClick: () => {
        clickHandler();
      }
    }, buttonText)
  );

  notices.push({
    react: el,
    id
  });

  updateCall();
};