import { useMemo } from "react";

type Props = {
  defaultValue?: Date;
  onChange?: (date: string) => void;
  time?: string | number; //The time of the movie
  availableTime?: string[]; //The available showtime of the movie
};

function ShowTimePicker({
  defaultValue,
  onChange,
  time = "10:00",
  availableTime = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
}: Props) {
  const activeIndex = useMemo(() => availableTime.findIndex((item) => item === time), [time, availableTime]);
  return (
    <div>
      <div className="form-control flex-row w-full justify-evenly items-center bg-base-100 px-4 py-2 rounded-md">
        {availableTime.map((time, index) => (
          <div className="w-fit" key={time}>
            <label
              htmlFor={time}
              className={`label btn btn-sm px-5 rounded-full flex items-center justify-center ${
                index === activeIndex ? "btn-secondary" : ""
              }`}
            >
              <span>{time}</span>
            </label>
            <input
              type="radio"
              name="timeShowtime"
              id={time}
              className="radio hidden"
              value={time}
              checked={index === activeIndex}
              onChange={() => {
                if (onChange) {
                  onChange(time);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowTimePicker;
