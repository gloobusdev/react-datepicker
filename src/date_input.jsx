import moment from "moment";
import ReactDOM from "react-dom";
import React from "react";
import MaskedInput from "react-maskedinput";
var DateInput = React.createClass({

  getDefaultProps() {
    return {
      dateFormat: "YYYY-MM-DD",
      className: "datepicker__input",
      onBlur() {}
    };
  },

  componentWillMount() {
    this.setState({
        maybeDate: this.safeDateFormat(this.props.date)
    });
  },

  componentDidMount() {
    this.toggleFocus(this.props.focus);
  },

  componentWillReceiveProps(newProps) {
    this.toggleFocus(newProps.focus);

    // It checks that user is typing some date and
    // we should skipp updating because it would clear date input.
    // In particular, it checks that we pass the typeable flag in datepicker props
    // and that input has focus
    // and that new date is null (when input date is invalid the "this.props.invalidateSelected()"
    // method sets state as null).
    // The main disadvantage of this approach is that it is imposible to clear date
    // while the input has focus.
    var doesUserType = newProps.isTypeable && newProps.focus && !newProps.date;

    // If we're receiving a different date then apply it.
    // If we're receiving a null date continue displaying the
    // value currently in the textbox.
    if (newProps.date != this.props.date && !doesUserType) {
        this.setState({
            maybeDate: this.safeDateFormat(newProps.date)
        });
    }
  },

  toggleFocus(focus) {
    if (focus) {
      this.refs.input.focus();
    } else {
      this.refs.input.blur();
    }
  },

  handleChange(event) {
    var value = event.target.value;
    const {handleChange} = this.props
      this.setState({
          maybeDate: value
      });
      handleChange(value)
  },

  safeDateFormat(date) {
    return !!date ? date.format(this.props.dateFormat) : null;
  },

  handleKeyDown(event) {
    switch (event.key) {
    case "Enter":
      event.preventDefault();
      this.props.handleEnter();
      break;
    case "Escape":
      event.preventDefault();
      this.props.hideCalendar();
      break;
    }
  },

  handleClick(event) {
    if (!this.props.disabled) {
      this.props.handleClick(event);
    }
  },

  handleOnClear(ev){
    this.props.handleClear(ev)
    this.setState({maybeDate: null})
  },

  render() {
    const {focus, isValid, placeholderText} = this.props
    const {maybeDate} = this.state
    let clearButton = null
    const value = maybeDate
    const isTyping = value && value.replace(/[^0-9]/g,"").length < 8
    const unfocusedColor = (isValid && !isTyping) ? undefined : 'red'
    const focusedColor = (isValid || isTyping) ? undefined : 'red'
    const focusState = focus ? focusedColor : unfocusedColor
    const color = value ? focusState : undefined

    if (this.props.isClearable && value && value.length > 0) {
      clearButton = (
        <a className="close-icon" href="#" onClick={this.handleOnClear}></a>
      );
    }
    return <div>
            <input 
              autoComplete="off"
              style={{color: color}}
              ref="input"
              id={this.props.id}
              name={this.props.name}
              value={value || ''}
              onClick={this.handleClick}
              onKeyDown={this.handleKeyDown}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              onChange={this.handleChange}
              className={`ignore-react-onclickoutside ${this.props.className}`}
              disabled={this.props.disabled}
              placeholder={placeholderText}
              readOnly={this.props.readOnly}
              required={this.props.required}
              tabIndex={this.props.tabIndex} 
            />  
            {clearButton}
          </div>
   }
});

module.exports = DateInput;
