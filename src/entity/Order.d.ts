import { IBase } from "./Base";
import { Customer } from "./Customer";
import { OrderItem } from "./OrderItem";
import { Ticket } from "./Ticket";

export interface Order extends IBase {
  customerId?: string;
  customer?: Customer;
  total?: number;
  status?: boolean;
  orderItems?: OrderItem[];
  tickets?: Ticket[];
}
