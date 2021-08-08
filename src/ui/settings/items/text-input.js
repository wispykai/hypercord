import _Divider from './divider';

export default () => {
const { React } = hypercord.webpackModules.common;

const Divider = _Divider;

const FormItem = hypercord.webpackModules.findByDisplayName('FormItem');
const FormText = hypercord.webpackModules.findByDisplayName('FormText');
const TextInput = hypercord.webpackModules.findByDisplayName('TextInput');

const Flex = hypercord.webpackModules.findByDisplayName('Flex');
const Margins = hypercord.webpackModules.findByProps('marginTop20', 'marginBottom20');
const FormClasses = hypercord.webpackModules.findByProps('formText', 'description');


return class TextInputGM extends React.PureComponent {
  render() {
    return React.createElement(FormItem, {
        title: this.props.text,
        className: [Flex.Direction.VERTICAL, Flex.Justify.START, Flex.Align.STRETCH, Flex.Wrap.NO_WRAP, Margins.marginBottom20].join(' ')
      },

      React.createElement(TextInput, {
        onChange: (x) => {
          this.props.oninput(x);
        },
        defaultValue: this.props.initialValue ? this.props.initialValue() : ''
      }),

      this.props.subtext && React.createElement(FormText, {
        className: [FormClasses.description, Margins.marginTop8].join(' ')
      }, this.props.subtext),

      React.createElement(Divider)
    );
  }
}
};