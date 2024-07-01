import { useMemo } from "react";

type Props = {
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  showDate?: number; //Number of days to show, default is 7 (1 week)
  currentDate?: Date;
};

function DatePicker({ defaultValue, onChange, showDate = 7, currentDate }: Props) {
  //Get next 7 days
  const dates = Array.from({ length: showDate }, (_, i) => {
    const date = defaultValue || new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const currentDateIndex = useMemo(
    () =>
      dates.findIndex((item) => {
        return item.getDate() === currentDate?.getDate() && item.getMonth() === currentDate?.getMonth();
      }),

    [defaultValue, dates, currentDate]
  );

  const setDate = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className="form-control flex-row w-full justify-evenly items-center bg-base-100 px-4 rounded-md">
      {dates.map((date, index) => {
        return (
          <div key={`${date.getDate()}/${date.toLocaleString("default", { month: "numeric" })}`} className={`w-fit `}>
            <label
              htmlFor={`${date.getDate()}/${date.toLocaleString("default", { month: "numeric" })}`}
              className={`label btn px-5 py-2 rounded-none flex items-center justify-center
              ${currentDateIndex === index ? "btn-primary" : "btn-ghost"}`}
            >
              <span>
                {date.toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  weekday: "long",
                  //Language: "vi",
                })}
              </span>
              {`${date.getDate()}/${date.toLocaleString("default", { month: "numeric" })}`}
            </label>
            <input
              type="radio"
              name="dateShowtime"
              id={`${date.getDate()}/${date.toLocaleString("default", { month: "numeric" })}`}
              checked={currentDateIndex === index}
              className="radio hidden"
              value={date.toLocaleString("default", { month: "numeric" })}
              onChange={() => {
                setDate(date);
              }}
              // hidden
            />
          </div>
        );
      })}
    </div>
  );
}

export default DatePicker;
