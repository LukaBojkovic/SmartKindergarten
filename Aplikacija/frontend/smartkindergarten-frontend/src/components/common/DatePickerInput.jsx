import DatePicker, { registerLocale } from "react-datepicker";
import { format, parse } from "date-fns";
import { srLatn } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("sr-Latn", srLatn);

function DatePickerInput({
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "dd/mm/gggg",
}) 
{
  const selectedDate = value ? parse(value, "yyyy-MM-dd", new Date()) : null;

  const handleChange = (date) => {
    const formattedValue = date ? format(date, "yyyy-MM-dd") : "";

    onChange({
      target: {
        name,
        value: formattedValue,
      },
    });
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="dd/MM/yyyy"
      locale="sr-Latn"
      className="form-control"
      wrapperClassName="w-100"
      placeholderText={placeholder}
      required={required}
      disabled={disabled}
      isClearable={!required}
    />
  );
}

export default DatePickerInput;