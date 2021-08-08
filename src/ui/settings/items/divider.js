export default () => {
const { React } = hypercord.webpackModules.common;

const FormDivider = hypercord.webpackModules.findByDisplayName('FormDivider');
const SettingsFormClasses = hypercord.webpackModules.findByProps('dividerDefault', 'titleDefault');

return class Divider extends React.PureComponent {
  render() {
    return React.createElement(FormDivider, {
      className: SettingsFormClasses.dividerDefault
    });
  }
}
};