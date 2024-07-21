import React, { useMemo } from "react";
import { Seat as SeatEntity } from "../entity/Seat";
import Seat from "./Seat";

type SeatMapProps = {
  defaultSeats: SeatEntity[];
  reservedSeats: SeatEntity[];
  seatToggle: (seat: SeatEntity) => void;
  chosenSeats: SeatEntity[];
};

export default function SeatMap({
  defaultSeats,
  reservedSeats,
  seatToggle,
  chosenSeats,
}: SeatMapProps) {
  const data = useMemo(() => {
    const seats = defaultSeats.map((item) => {
      return {
        id: `${item.rowName}${item.seatNumber}`, // Unique ID for each seat
        rowName: item.rowName,
        seatNumber: item.seatNumber,
        reserved: reservedSeats.find((seat) => {
          return (
            seat.rowName === item.rowName && seat.seatNumber === item.seatNumber
          );
        })
          ? false
          : true,
      };
    });

    const rows = seats
      .map((item) => item.rowName.charCodeAt(0))
      .sort((a, b) => a - b);
    const rowsSet = new Set(rows);
    const rowsArray = Array.from(rowsSet);

    const columns = Math.max(...seats.map((item) => item.seatNumber));

    return {
      seats,
      rows: rowsArray.length,
      columns,
    };
  }, [defaultSeats, reservedSeats]);

  return (
    <div className="gap-2 flex flex-col justify-center items-center">
      <div className="w-full mx-auto h-fit my-4">
        <div className="w-1/2 h-4 rounded-full mx-auto rounded-b-xl border bg-slate-700 border-base-200"></div>
        <span className="text-sm py-2">Màn hình</span>
      </div>
      <div>
        {Array.from({ length: data.rows }, (_, i) => (
          <div className="flex gap-2" key={`row-${i}`}>
            {" "}
            {/* Use unique key here */}
            {Array.from({ length: data.columns }, (_, j) => {
              const seatIndex = i * data.columns + j;
              const seat = data.seats[seatIndex];
              return (
                <Seat
                  key={seat.id} // Use unique key here
                  seatData={seat}
                  seatToggle={seatToggle}
                  isTaken={seat.reserved}
                  isChosen={chosenSeats.some((item) => item.id === seat.id)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
