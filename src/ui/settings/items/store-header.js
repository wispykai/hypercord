export default () => {
const { React } = hypercord.webpackModules.common;

const Text = hypercord.webpackModules.findByDisplayName('Text');

const HeaderClasses = hypercord.webpackModules.findByProps('pageHeader');

return class StoreHeader extends React.PureComponent {
  render() {
    return React.createElement('div', {
      className: [HeaderClasses.headerContainer, 'gm-store-header'].join(' ')
    }, React.createElement(Text, {
        color: Text.Colors.HEADER_PRIMARY,
        size: Text.Sizes.SIZE_20,

        className: HeaderClasses.pageHeader
      }, this.props.text)
    );
  }
}
};