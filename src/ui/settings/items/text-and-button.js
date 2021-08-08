import _Divider from './divider';

export default () => {
const { React } = hypercord.webpackModules.common;

const Divider = _Divider();

const Button = hypercord.webpackModules.findByProps('Sizes', 'Colors', 'Looks', 'DropdownSizes');

const Markdown = hypercord.webpackModules.findByDisplayName('Markdown');

const FormItem = hypercord.webpackModules.findByDisplayName('FormItem');
const FormText = hypercord.webpackModules.findByDisplayName('FormText');

const Flex = hypercord.webpackModules.findByDisplayName('Flex');
const Margins = hypercord.webpackModules.findByProps('marginTop20', 'marginBottom20');

const FormClasses = hypercord.webpackModules.findByProps('title', 'dividerDefault');
const FormTextClasses = hypercord.webpackModules.findByProps('formText', 'placeholder');

return class TextAndButton extends React.PureComponent {
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
          },
            React.createElement(Markdown, {
              className: 'gm-settings-note-markdown'
            }, this.props.subtext || '')
          )
        ),

        React.createElement(Button, {
            color: this.props.danger ? Button.Colors.RED : Button.Colors.BRAND,
            disabled: this.props.disabled,

            onClick: () => this.props.onclick()
          },

          this.props.buttonText
        ),
      ),

      React.createElement(Divider)
    );
  }
}
};