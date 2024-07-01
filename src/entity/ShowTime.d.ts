import { IBase } from "./Base";
import { Movie } from "./Movie";
import { Room } from "./Room";
import { Seat } from "./Seat";

export interface ShowTime extends IBase {
  movieId?: string;
  movie?: Movie;
  roomNumberId?: number;
  room?: Room;
  startTime?: string;
  endTime?: string;
  seats?: Seat[];
}
