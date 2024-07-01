import { IBase } from "./Base";
import { Order } from "./Order";
import { OrderItem } from "./OrderItem";
import { Seat } from "./Seat";
import { ShowTime } from "./ShowTime";

interface Ticket extends IBase {
  orderId?: string;
  order?: Order;
  total?: number;
  status?: boolean;
  orderItems?: OrderItem[];
  seatId?: string;
  showtimeId?: string;
  showTime?: ShowTime;
  seat: Seat;
}
