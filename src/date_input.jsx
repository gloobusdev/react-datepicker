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
    var date = moment(value, this.props.dateFormat, true);
    const {handleChange} = this.props
    this.setState({
        maybeDate: value
    });

    handleChange(date)

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

  render() {
    const {focus, date, isValid} = this.props
    const {maybeDate} = this.state
    const chosenDate = date && moment(date).format(this.props.dateFormat)
    const value = maybeDate || chosenDate
    const isTyping = value && value.replace(/[^0-9]/g,"").length < 8
    const dateFormatHelper = {}
    const unfocusedColor = (isValid && !isTyping) ? undefined : 'red'
    const focusedColor = (isValid || isTyping) ? undefined : 'red'
    const focusState = focus ? focusedColor : unfocusedColor
    const color = value ? focusState : undefined
    const dateFormat = this.props.dateFormat.replace(/dd/i, "Dd").replace(/mm/i, "Mm").replace(/yyyy/i, "Yyyy")
    return <MaskedInput
        style={{color}}
        mask={dateFormat}
        formatCharacters={{
            'D': {
                validate: (char) => {
                    const patt = /[0-3]/
                    if(patt.test(char)){
                        dateFormatHelper['D'] = parseInt(char)
                        return true
                    }
                },
            },
            'd': {
                validate: (char) => {
                    let patt = false
                    if(dateFormatHelper.D === 0){
                        patt = /[1-9]/
                    } else if(dateFormatHelper.D < 3){
                        patt = /[0-9]/
                    } else {
                        patt = /[0-1]/
                    }
                    return patt.test(char)
                },
            },
            'M': {
                validate: (char) => {
                    const patt = /[0-1]/
                    if(patt.test(char)){
                        dateFormatHelper['M'] = parseInt(char)
                        return true
                    }
                },
            },
            'm': {
                validate: (char) => {
                    let patt = false
                    if(dateFormatHelper.M === 0){
                        patt = /[1-9]/
                    }  else {
                        patt = /[0-2]/
                    }
                    return patt.test(char)
                },
            },
            'Y': {
                validate: (char) => {
                    const patt = /[0-9]/g
                    return patt.test(char)
                },
            },
            'y': {
                validate: (char) => {
                    const patt = /[0-9]/g
                    return patt.test(char)
                },
            },
        }}
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
        placeholder={this.props.placeholderText}
        readOnly={this.props.readOnly}
        required={this.props.required}
        tabIndex={this.props.tabIndex} />;
  }
});

module.exports = DateInput;
