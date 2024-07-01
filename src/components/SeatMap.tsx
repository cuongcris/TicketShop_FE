import { useMemo } from "react";
import { Seat as SeatEnitiy } from "../entity/Seat";
import Seat from "./Seat";

type SeatMapProps = {
  defaulSeats: SeatEnitiy[];
  reservedSeats: SeatEnitiy[];
  seatToggle: (seat: SeatEnitiy) => void;
  chosenSeats: SeatEnitiy[];
};

export default function SeatMap({ defaulSeats, reservedSeats, seatToggle, chosenSeats }: SeatMapProps) {
  const data = useMemo(() => {
    //Convert seats to SeatMap
    const seats = defaulSeats.map((item) => {
      return {
        id: item.rowName + item.seatNumber,
        rowName: item.rowName,
        seatNumber: item.seatNumber,
        reserved: reservedSeats.find((seat) => {
          return seat.rowName === item.rowName && seat.seatNumber === item.seatNumber;
        })
          ? false
          : true,
      };
    });
    //Gets rows by CharCode

    const rows = seats.map((item) => item.rowName.charCodeAt(0)).sort((a, b) => a - b);
    const rowsSet = new Set(rows);
    const rowsArray = Array.from(rowsSet);

    //Gets columns by seatNumber
    const columns = Math.max(...seats.map((item) => item.seatNumber));

    return {
      seats,
      rows: rowsArray.length,
      columns,
    };
  }, [defaulSeats, reservedSeats]);
  return (
    <div className="gap-2 flex flex-col justify-center items-center">
      {/* Screen here */}
      <div className="w-full mx-auto h-fit my-4">
        <div className="w-1/2 h-4 rounded-full mx-auto rounded-b-xl border bg-slate-700 border-base-200"></div>
        <span className="text-sm py-2">Màn hình</span>
      </div>
      <div>
        {Array.from({ length: data.rows }, (_, i) => {
          return (
            <div className="flex gap-2" key={data.seats[i].rowName}>
              {Array.from({ length: data.columns }, (_, j) => {
                return (
                  <Seat
                    key={data.seats[i * data.columns + j].id}
                    seatData={data.seats[i * data.columns + j]}
                    seatToggle={seatToggle}
                    isTaken={data.seats[i * data.columns + j].reserved}
                    isChosen={
                      chosenSeats.find((item) => item.id === data.seats[i * data.columns + j].id) ? true : false
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
