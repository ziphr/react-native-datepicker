// @ts-nocheck
import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  DatePickerAndroid,
  TimePickerAndroid,
  DatePickerIOS,
  Platform,
  Animated,
  Keyboard,
} from "react-native";

import { setLocale } from "@app/utils/moment-locale-setter";

import Style from "./style";

const moment = require("moment/min/moment-with-locales");

/* If the Phone Language is set to Indonesian then change
   the locale setting for Moment */
setLocale();

const FORMATS = {
  date: "YYYY-MM-DD",
  datetime: "YYYY-MM-DD HH:mm",
  time: "HH:mm",
};

const SUPPORTED_ORIENTATIONS = [
  "portrait",
  "portrait-upside-down",
  "landscape",
  "landscape-left",
  "landscape-right",
];

type OwnProps = {
  mode?: "date" | "datetime" | "time";
  androidMode?: "clock" | "calendar" | "spinner" | "default";
  date?: string | any | any;
  format?: string;
  minDate?: string | any; // TODO: PropTypes.instanceOf(Date)
  maxDate?: string | any; // TODO: PropTypes.instanceOf(Date)
  height?: number;
  duration?: number;
  confirmBtnText?: string;
  cancelBtnText?: string;
  iconSource?: number | any;
  iconComponent?: React.ReactElement;
  customStyles?: any;
  showIcon?: boolean;
  disabled?: boolean;
  allowFontScaling?: boolean;
  onDateChange?(dateStr: string, date: Date): void;
  onOpenModal?: (...args: any[]) => any;
  onCloseModal?: (...args: any[]) => any;
  onPressMask?: (...args: any[]) => any;
  placeholder?: string;
  modalOnResponderTerminationRequest?: (...args: any[]) => any;
  is24Hour?: boolean;
  getDateStr?: (...args: any[]) => any;
  locale?: string;
};

type State = any;

type Props = OwnProps & typeof DatePicker.defaultProps;

class DatePicker extends Component<Props, State> {
  static defaultProps: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      date: this.getDate(),
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      allowPointerEvents: true,
    };

    this.getDate = this.getDate.bind(this);
    this.getDateStr = this.getDateStr.bind(this);
    this.datePicked = this.datePicked.bind(this);
    this.onPressDate = this.onPressDate.bind(this);
    this.onPressCancel = this.onPressCancel.bind(this);
    this.onPressConfirm = this.onPressConfirm.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onPressMask = this.onPressMask.bind(this);
    this.onDatePicked = this.onDatePicked.bind(this);
    this.onTimePicked = this.onTimePicked.bind(this);
    this.onDatetimePicked = this.onDatetimePicked.bind(this);
    this.onDatetimeTimePicked = this.onDatetimeTimePicked.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.date !== this.props.date) {
      this.setState({ date: this.getDate(nextProps.date) });
    }
  }

  setModalVisible(visible: any) {
    const { height, duration } = this.props;

    // slide animation
    if (visible) {
      this.setState({ modalVisible: visible });
      // @ts-expect-error ts-migrate(2345) FIXME: Property 'useNativeDriver' is missing in type '{ t... Remove this comment to see the full error message
      return Animated.timing(this.state.animatedHeight, {
        toValue: height,
        duration,
      }).start();
    }
    // @ts-expect-error ts-migrate(2345) FIXME: Property 'useNativeDriver' is missing in type '{ t... Remove this comment to see the full error message
    return Animated.timing(this.state.animatedHeight, {
      toValue: 0,
      duration,
    }).start(() => {
      this.setState({ modalVisible: visible });
    });
  }

  onStartShouldSetResponder(e: any) {
    return true;
  }

  onMoveShouldSetResponder(e: any) {
    return true;
  }

  onPressMask() {
    if (typeof this.props.onPressMask === "function") {
      this.props.onPressMask();
    } else {
      this.onPressCancel();
    }
  }

  onPressCancel() {
    this.setModalVisible(false);

    if (typeof this.props.onCloseModal === "function") {
      this.props.onCloseModal();
    }
  }

  onPressConfirm() {
    this.datePicked();
    this.setModalVisible(false);

    if (typeof this.props.onCloseModal === "function") {
      this.props.onCloseModal();
    }
  }

  // @ts-expect-error ts-migrate(7023) FIXME: 'getDate' implicitly has return type 'any' because... Remove this comment to see the full error message
  getDate(date = this.props.date) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const { mode, minDate, maxDate, format = FORMATS[mode] } = this.props;

    // date默认值
    if (!date) {
      const now = new Date();
      if (minDate) {
        // @ts-expect-error ts-migrate(7022) FIXME: '_minDate' implicitly has type 'any' because it do... Remove this comment to see the full error message
        const _minDate = this.getDate(minDate);

        if (now < _minDate) {
          return _minDate;
        }
      }

      if (maxDate) {
        // @ts-expect-error ts-migrate(7022) FIXME: '_maxDate' implicitly has type 'any' because it do... Remove this comment to see the full error message
        const _maxDate = this.getDate(maxDate);

        if (now > _maxDate) {
          return _maxDate;
        }
      }

      return now;
    }

    if (date instanceof Date) {
      return date;
    }

    return moment(date, format).toDate();
  }

  getDateStr(date = this.props.date) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const { mode, format = FORMATS[mode] } = this.props;
    const dateInstance = date instanceof Date ? date : this.getDate(date);

    if (typeof this.props.getDateStr === "function") {
      return this.props.getDateStr(dateInstance);
    }

    return moment(dateInstance).format(format);
  }

  datePicked() {
    if (typeof this.props.onDateChange === "function") {
      this.props.onDateChange(
        this.getDateStr(this.state.date),
        this.state.date
      );
    }
  }

  getTitleElement() {
    const { date, placeholder, customStyles, allowFontScaling } = this.props;

    if (!date && placeholder) {
      return (
        <Text
          allowFontScaling={allowFontScaling}
          style={[Style.placeholderText, customStyles.placeholderText]}
        >
          {placeholder}
        </Text>
      );
    }
    return (
      <Text
        allowFontScaling={allowFontScaling}
        style={[Style.dateText, customStyles.dateText]}
      >
        {this.getDateStr()}
      </Text>
    );
  }

  onDateChange(date: any) {
    this.setState({
      allowPointerEvents: false,
      date,
    });
    const timeoutId = setTimeout(() => {
      this.setState({
        allowPointerEvents: true,
      });
      clearTimeout(timeoutId);
    }, 200);
  }

  onDatePicked({ action, year, month, day }: any) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day),
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  }

  onTimePicked({ action, hour, minute }: any) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: moment().hour(hour).minute(minute).toDate(),
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  }

  onDatetimePicked({ action, year, month, day }: any) {
    const {
      mode,
      androidMode,
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      format = FORMATS[mode],
      is24Hour = !format.match(/h|a/),
    } = this.props;

    if (action !== DatePickerAndroid.dismissedAction) {
      const timeMoment = moment(this.state.date);

      TimePickerAndroid.open({
        hour: timeMoment.hour(),
        minute: timeMoment.minutes(),
        is24Hour,
        mode: androidMode,
      }).then(this.onDatetimeTimePicked.bind(this, year, month, day));
    } else {
      this.onPressCancel();
    }
  }

  onDatetimeTimePicked(
    year: any,
    month: any,
    day: any,
    { action, hour, minute }: any
  ) {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day, hour, minute),
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  }

  onPressDate() {
    if (this.props.disabled) {
      return true;
    }

    Keyboard.dismiss();

    // reset state
    this.setState({
      date: this.getDate(),
    });

    if (Platform.OS === "ios") {
      this.setModalVisible(true);
    } else {
      const {
        mode,
        androidMode,
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        format = FORMATS[mode],
        minDate,
        maxDate,
        is24Hour = !format.match(/h|a/),
      } = this.props;

      // 选日期
      if (mode === "date") {
        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate),
          mode: androidMode,
        }).then(this.onDatePicked);
      } else if (mode === "time") {
        // 选时间

        const timeMoment = moment(this.state.date);

        TimePickerAndroid.open({
          hour: timeMoment.hour(),
          minute: timeMoment.minutes(),
          is24Hour,
          mode: androidMode,
        }).then(this.onTimePicked);
      } else if (mode === "datetime") {
        // 选日期和时间

        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate),
          mode: androidMode,
        }).then(this.onDatetimePicked);
      }
    }

    if (typeof this.props.onOpenModal === "function") {
      this.props.onOpenModal();
    }
  }

  _renderIcon() {
    const { showIcon, iconSource, iconComponent, customStyles } = this.props;

    if (showIcon) {
      if (iconComponent) {
        return iconComponent;
      }
      return (
        <Image
          source={iconSource}
          style={[Style.dateIcon, customStyles.dateIcon]}
        />
      );
    }

    return null;
  }

  render() {
    const {
      mode,
      style,
      customStyles,
      disabled,
      minDate,
      maxDate,
      minuteInterval,
      timeZoneOffsetInMinutes,
      cancelBtnText,
      confirmBtnText,
      TouchableComponent,
      testID,
      cancelBtnTestID,
      confirmBtnTestID,
      allowFontScaling,
      locale,
    } = this.props;

    const dateInputStyle = [
      Style.dateInput,
      customStyles.dateInput,
      disabled && Style.disabled,
      disabled && customStyles.disabled,
    ];

    return (
      <TouchableComponent
        onPress={this.onPressDate}
        style={[Style.dateTouch, style]}
        testID={testID}
        underlayColor="transparent"
      >
        <View style={[Style.dateTouchBody, customStyles.dateTouchBody]}>
          {!this.props.hideText ? (
            <View style={dateInputStyle}>{this.getTitleElement()}</View>
          ) : (
            <View />
          )}
          {this._renderIcon()}
          {Platform.OS === "ios" && (
            <Modal
              animationType="none"
              onRequestClose={() => {
                this.setModalVisible(false);
              }}
              supportedOrientations={SUPPORTED_ORIENTATIONS}
              transparent
              visible={this.state.modalVisible}
            >
              <View style={{ flex: 1 }}>
                <TouchableComponent
                  activeOpacity={1}
                  onPress={this.onPressMask}
                  style={Style.datePickerMask}
                  underlayColor="#00000077"
                >
                  <TouchableComponent style={{ flex: 1 }} underlayColor="#fff">
                    <Animated.View
                      style={[
                        Style.datePickerCon,
                        { height: this.state.animatedHeight },
                        customStyles.datePickerCon,
                      ]}
                    >
                      <View
                        pointerEvents={
                          this.state.allowPointerEvents ? "auto" : "none"
                        }
                      >
                        <DatePickerIOS
                          date={this.state.date}
                          locale={locale}
                          maximumDate={maxDate && this.getDate(maxDate)}
                          minimumDate={minDate && this.getDate(minDate)}
                          minuteInterval={minuteInterval}
                          mode={mode}
                          onDateChange={this.onDateChange}
                          style={[Style.datePicker, customStyles.datePicker]}
                          timeZoneOffsetInMinutes={
                            timeZoneOffsetInMinutes || null
                          }
                        />
                      </View>
                      <TouchableComponent
                        onPress={this.onPressCancel}
                        style={[
                          Style.btnText,
                          Style.btnCancel,
                          customStyles.btnCancel,
                        ]}
                        testID={cancelBtnTestID}
                        underlayColor="transparent"
                      >
                        <Text
                          allowFontScaling={allowFontScaling}
                          style={[
                            Style.btnTextText,
                            Style.btnTextCancel,
                            customStyles.btnTextCancel,
                          ]}
                        >
                          {cancelBtnText}
                        </Text>
                      </TouchableComponent>
                      <TouchableComponent
                        onPress={this.onPressConfirm}
                        style={[
                          Style.btnText,
                          Style.btnConfirm,
                          customStyles.btnConfirm,
                        ]}
                        testID={confirmBtnTestID}
                        underlayColor="transparent"
                      >
                        <Text
                          allowFontScaling={allowFontScaling}
                          style={[
                            Style.btnTextText,
                            customStyles.btnTextConfirm,
                          ]}
                        >
                          {confirmBtnText}
                        </Text>
                      </TouchableComponent>
                    </Animated.View>
                  </TouchableComponent>
                </TouchableComponent>
              </View>
            </Modal>
          )}
        </View>
      </TouchableComponent>
    );
  }
}

DatePicker.defaultProps = {
  mode: "date",
  androidMode: "default",
  date: "",
  // component height: 216(DatePickerIOS) + 1(borderTop) + 42(marginTop), IOS only
  height: 259,

  // slide animation duration time, default to 300ms, IOS only
  duration: 300,
  confirmBtnText: "确定",
  cancelBtnText: "取消",
  iconSource: require("./date_icon.png"),
  customStyles: {},

  // whether or not show the icon
  showIcon: true,
  disabled: false,
  allowFontScaling: true,
  hideText: false,
  placeholder: "",
  TouchableComponent: TouchableHighlight,
  modalOnResponderTerminationRequest: (e: any) => true,
};

export default DatePicker;
