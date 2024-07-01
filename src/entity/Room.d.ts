import { IBase } from "./Base";
import { Seat } from "./Seat";
import { ShowTime } from "./ShowTime";

export interface Room extends IBase {
  roomNumber?: number;
  seats: Seat[];
  showTimes?: ShowTime[];
}
