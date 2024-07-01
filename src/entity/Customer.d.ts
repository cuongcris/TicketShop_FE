import { IBase } from "./Base";
import { Employee } from "./Employee";
import { Order } from "./Order";

interface Customer extends IBase, Employee {
  email?: string;
  emailConfirm?: boolean;
  phoneConfirm?: boolean;
  point?: number;
  orders?: Order[];
}
