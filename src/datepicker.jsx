import isEqual from "lodash/lang/isEqual";
import moment from "moment";
import DateInput from "./date_input";
import Calendar from "./calendar";
import Popover from "./popover";
import React from "react";
import ReactDOM from "react-dom";

var DatePicker = React.createClass({

  propTypes: {
    weekdays: React.PropTypes.arrayOf(React.PropTypes.string),
    locale: React.PropTypes.string,
    dateFormatCalendar: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    id: React.PropTypes.string,
    popoverAttachment: React.PropTypes.string,
    popoverTargetAttachment: React.PropTypes.string,
    popoverTargetOffset: React.PropTypes.string,
    weekStart: React.PropTypes.string,
    showYearDropdown: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    onBlur: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onClear: React.PropTypes.func,
    tabIndex: React.PropTypes.number,
    isTypeable: React.PropTypes.bool,
    filterDate: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      locale: "en",
      dateFormatCalendar: "MMMM YYYY",
      moment: moment,
      onChange() {},
      disabled: false,
      onFocus() {},
      onBlur() {},
      onClear() {},
      isTypeable: false
    };
  },

  getInitialState() {
    return {
      dateValid: true,
      focus: false,
      selected: this.props.selected
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      selected: nextProps.selected
    });
  },

  shouldComponentUpdate(nextProps, nextState) {
    return !(isEqual(nextProps, this.props) && isEqual(nextState, this.state));
  },

  getValue() {
    return this.state.selected;
  },

  handleFocus() {
    if(this.state.focus) { return }
    this.props.onFocus();
    setTimeout(() => {
      this.setState({ focus: true });
    }, 200);
  },

  handleBlur() {
    const {focus, dateValid, selected} = this.state
    if(!focus) { return }
    setTimeout(() => {
      if (!this.state.datePickerHasFocus) {
        this.props.onBlur(this.state.selected);
        if( !dateValid){
          this.props.dateError(true)
        }
        this.hideCalendar();
      }
    }, 200);
  },

  hideCalendar() {
    setTimeout(() => {
      this.setState({
        focus: false
      });
    }, 0);
  },

  doesDatePickerContainElement(element) {
    var datePicker = ReactDOM.findDOMNode(this.refs.calendar);
    if (!datePicker) {
      return false;
    }
    return datePicker.contains(element);
  },

  reformatMoment(val) {
      const {dateFormat} = this.props
      const stringVal = val.format(dateFormat)
      return moment(stringVal, dateFormat)
  },

  handleSelect(value) {
    const {minDate, maxDate, dateFormat} = this.props
    const rMinDate = this.reformatMoment(minDate)
    const rMaxDate = this.reformatMoment(maxDate)
    const date = moment(value, dateFormat);
    const rDate = this.reformatMoment(date)
    let valid = false
    if (
        this.validateDate(value) &&
        (rMinDate ? rDate.isSameOrAfter(rMinDate) : true) &&
        (rMaxDate ? rDate.isSameOrBefore(rMaxDate) : true)
    ) {
        valid = true
        this.setSelected(date);
    } else if(!value || value.length === 0){
        valid = true
    }
    this.setState({dateValid: valid})
  },

  validateDate (data) {
		return (moment(data, "DD-MM-YYYY", true).isValid()
		|| moment(data, "DD/MM/YYYY", true).isValid()
		|| moment(data, "DD.MM.YYYY", true).isValid()
		|| moment(data, "DD MM YYYY", true).isValid())? true : false
	},

  setSelected(date) {
    this.setState({
      selected: date
    }, () => {
      this.props.onChange(this.state.selected);
    });
  },

  invalidateSelected() {
    if (this.state.selected === null) return;
    this.props.onChange(null);
  },

  onInputClick(event) {
    var previousFocusState = this.state.focus;

    this.setState({
      focus: true,
      datePickerHasFocus: this.doesDatePickerContainElement(event.target)
    }, () => {
      this.forceUpdate();
    });
  },

  onClearClick(event) {
    event.preventDefault();
    // Due to issues with IE onchange events sometimes this gets noisy, so skip if we've already cleared
    if (this.state.selected === null) return;

    this.setState({
      dateValid: true,
      focus: false,
      selected: null
    }, () => {
      this.props.onClear();
      this.props.onChange(null);
    });
  },

  calendar() {
    if (this.state.focus) {
      return (
        <Popover
          attachment={this.props.popoverAttachment}
          targetAttachment={this.props.popoverTargetAttachment}
          targetOffset={this.props.popoverTargetOffset}
          constraints={this.props.tetherConstraints}>

          <Calendar
            ref="calendar"
            weekdays={this.props.weekdays}
            locale={this.props.locale}
            moment={this.props.moment}
            dateFormat={this.props.dateFormatCalendar}
            selected={this.state.selected}
            onSelect={this.handleSelect}
            hideCalendar={this.hideCalendar}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            startDate={this.props.startDate}
            endDate={this.props.endDate}
            excludeDates={this.props.excludeDates}
            filterDate={this.props.filterDate}
            handleClick={this.onInputClick}
            includeDates={this.props.includeDates}
            weekStart={this.props.weekStart}
            showYearDropdown={this.props.showYearDropdown} />
        </Popover>
      );
    }
  },

  render() {
    const {dateValid} = this.state
    return (
      <div className="datepicker__input-container">
        <DateInput
          ref="input"
          id={this.props.id}
          name={this.props.name}
          date={this.state.selected}
          dateFormat={this.props.dateFormat}
          focus={this.state.focus}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          handleClick={this.onInputClick}
          handleEnter={this.hideCalendar}
          invalidateSelected={this.invalidateSelected}
          placeholderText={this.props.placeholderText}
          disabled={this.props.disabled}
          className={this.props.className}
          title={this.props.title}
          readOnly={this.props.readOnly}
          required={this.props.required}
          tabIndex={this.props.tabIndex}
          handleChange={this.handleSelect}
          isValid={dateValid}
          dateError={this.props.dateError}
          isTypeable={this.props.isTypeable}
          isClearable={this.props.isClearable}
          handleClear={this.onClearClick} />
        {this.props.disabled ? null : this.calendar()}
      </div>
    );
  }
});

module.exports = DatePicker;
