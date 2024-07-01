import { TbArmchair2, TbArmchair2Off } from "react-icons/tb";
import { Seat as SeatEnitiy } from "../entity/Seat";
export type SeatProps = {
  isTaken?: boolean;
  seatData: SeatEnitiy;

  isChosen?: boolean;
  seatToggle: (seat: SeatEnitiy) => void;
};

export default function Seat({ isTaken = false, seatData, isChosen, seatToggle }: SeatProps) {
  return (
    <div className="text-2xl tooltip" data-tip={`${isTaken ? seatData.rowName + seatData.seatNumber : ""}`}>
      {isTaken ? (
        <button
          onClick={() => {
            seatToggle(seatData);
          }}
          type="button"
        >
          <TbArmchair2
            className={`cursor-pointer hover:text-secondary transition-all duration-200 ${
              isChosen ? "text-secondary-focus" : " "
            }`}
          />
        </button>
      ) : (
        <TbArmchair2Off className="cursor-not-allowed text-error" />
      )}
    </div>
  );
}
