export default () => {
const { React } = hypercord.webpackModules.common;

const FormText = hypercord.webpackModules.findByDisplayName('FormText');
const Markdown = hypercord.webpackModules.findByDisplayName('Markdown');

const Margins = hypercord.  webpackModules.findByProps('marginTop20', 'marginBottom20');

return class Subtext extends React.PureComponent {
  render() {
    return React.createElement(FormText, {
      type: 'description',
      className: Margins.marginBottom20
    },
      React.createElement(Markdown, {
        className: 'gm-settings-note-markdown'
      }, this.props.text || '')
    );
  }
}
};