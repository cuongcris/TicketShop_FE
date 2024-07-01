import { IBase } from "./Base";
import { Room } from "./Room";
import { Ticket } from "./Ticket";

export interface Seat extends IBase {
  rowName: string;
  seatNumber: number;
  roomNumberId?: number;
  room?: Room;
  tickets?: Ticket[];
}
