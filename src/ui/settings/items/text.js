import _Divider from './divider';

export default () => {
const Divider = _Divider();
const { React } = hypercord.webpackModules.common;

const FormItem = hypercord.webpackModules.findByDisplayName('FormItem');
const FormText = hypercord.webpackModules.findByDisplayName('FormText');

const Flex = hypercord.webpackModules.findByDisplayName('Flex');
const Margins = hypercord.webpackModules.findByProps('marginTop20', 'marginBottom20');

const FormClasses = hypercord.webpackModules.findByProps('title', 'dividerDefault');
const FormTextClasses = hypercord.webpackModules.findByProps('formText', 'placeholder');


return class Text extends React.PureComponent {
  render() {
    return React.createElement(FormItem, {
        className: [Flex.Direction.VERTICAL, Flex.Justify.START, Flex.Align.STRETCH, Flex.Wrap.NO_WRAP, Margins.marginBottom20].join(' '),
      },

      React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between'
          }
        },

        React.createElement('div', {},
          React.createElement('div', {
              className: FormClasses.labelRow,
              style: {
                marginBottom: '4px'
              }
            },

            React.createElement('label', {
              class: FormClasses.title
            }, this.props.text)
          ),

          React.createElement(FormText, {
            className: FormTextClasses.description
          }, this.props.subtext)
        )
      ),

      React.createElement(Divider)
    );
  }
}
};