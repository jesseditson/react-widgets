'use strict';

var babelHelpers = require('./util/babelHelpers.js');

var React = require('react'),
    _ = require('./util/_'),
    cx = require('classnames'),
    Btn = require('./WidgetButton'),
    CustomPropTypes = require('./util/propTypes');

module.exports = React.createClass({

  displayName: 'MultiselectTagList',

  mixins: [require('./mixins/DataHelpersMixin'), require('./mixins/PureRenderMixin')],

  propTypes: {
    value: React.PropTypes.array,

    valueField: React.PropTypes.string,
    textField: CustomPropTypes.accessor,

    valueComponent: React.PropTypes.func,

    disabled: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.array, React.PropTypes.oneOf(['disabled'])]),

    readOnly: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.array, React.PropTypes.oneOf(['readonly'])])
  },

  getInitialState: function getInitialState() {
    return {
      focused: null
    };
  },

  render: function render() {
    var _this = this;

    var ValueComponent = this.props.valueComponent,
        props = _.omit(this.props, ['value', 'disabled', 'readOnly']),
        focusIdx = this.state.focused,
        value = this.props.value;

    return React.createElement(
      'ul',
      babelHelpers._extends({}, props, {
        className: 'rw-multiselect-taglist' }),
      value.map(function (item, i) {
        var disabled = _this.isDisabled(item),
            readonly = _this.isReadOnly(item);

        return React.createElement(
          'li',
          { key: i,
            className: cx({
              'rw-state-focus': !disabled && focusIdx === i,
              'rw-state-disabled': disabled,
              'rw-state-readonly': readonly }) },
          ValueComponent ? React.createElement(ValueComponent, { item: item }) : _this._dataText(item),
          React.createElement(
            Btn,
            { tabIndex: '-1', onClick: !(disabled || readonly) && _this._delete.bind(null, item),
              'aria-disabled': disabled,
              disabled: disabled },
            '×',
            React.createElement(
              'span',
              { className: 'rw-sr' },
              'Remove ' + _this._dataText(item)
            )
          )
        );
      })
    );
  },

  _delete: function _delete(val, e) {
    this.props.onDelete(val);
  },

  removeCurrent: function removeCurrent() {
    var val = this.props.value[this.state.focused];

    if (val && !(this.isDisabled(val) || this.isReadOnly(val))) this.props.onDelete(val);
  },

  isDisabled: function isDisabled(val, isIdx) {
    if (isIdx) val = this.props.value[val];

    return this.props.disabled === true || this._dataIndexOf(this.props.disabled || [], val) !== -1;
  },

  isReadOnly: function isReadOnly(val, isIdx) {
    if (isIdx) val = this.props.value[val];

    return this.props.readOnly === true || this._dataIndexOf(this.props.readOnly || [], val) !== -1;
  },

  removeNext: function removeNext() {
    var val = this.props.value[this.props.value.length - 1];

    if (val && !(this.isDisabled(val) || this.isReadOnly(val))) this.props.onDelete(val);
  },

  clear: function clear() {
    this.setState({ focused: null });
  },

  first: function first() {
    var idx = 0,
        l = this.props.value.length;

    while (idx < l && this.isDisabled(idx, true)) idx++;

    if (idx !== l) this.setState({ focused: idx });
  },

  last: function last() {
    var idx = this.props.value.length - 1;

    while (idx > -1 && this.isDisabled(idx, true)) idx--;

    if (idx >= 0) this.setState({ focused: idx });
  },

  next: function next() {
    var nextIdx = this.state.focused + 1,
        l = this.props.value.length;

    while (nextIdx < l && this.isDisabled(nextIdx, true)) nextIdx++;

    if (this.state.focused === null) return;

    if (nextIdx >= l) return this.clear();

    this.setState({ focused: nextIdx });
  },

  prev: function prev() {
    var nextIdx = this.state.focused;

    if (nextIdx === null) nextIdx = this.props.value.length;

    nextIdx--;

    while (nextIdx > -1 && this.isDisabled(nextIdx, true)) nextIdx--;

    if (nextIdx >= 0) this.setState({ focused: nextIdx });
  }
});