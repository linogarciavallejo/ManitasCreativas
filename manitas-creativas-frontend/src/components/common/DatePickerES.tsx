import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import locale from 'antd/es/date-picker/locale/es_ES';

// Configure dayjs to use Spanish locale
dayjs.locale('es');

// This is a customized DatePicker that uses Spanish locale by default
// and prevents the strange date jumping behavior
export const DatePickerES: React.FC<DatePickerProps> = (props) => {
  return (
    <AntDatePicker
      locale={locale}
      format="DD/MM/YYYY"
      placeholder="Seleccione la fecha"
      showToday
      allowClear
      {...props}
    />
  );
}

export default DatePickerES;
