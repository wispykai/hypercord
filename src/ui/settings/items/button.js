export default () => {
const { React } = hypercord.webpackModules.common;

const Button = hypercord.webpackModules.findByProps('Sizes', 'Colors', 'Looks', 'DropdownSizes');


return class Button extends React.PureComponent {
  render() {
    return React.createElement(Button, {
      color: Button.Colors.BRAND,
      size: Button.Sizes.SMALL,

      disabled: this.props.disabled,

      onClick: () => this.props.onclick()
    },

    this.props.text
    );
  }
}
};