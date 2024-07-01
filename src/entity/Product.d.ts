import { IBase } from "./Base";
import { OrderItem } from "./OrderItem";

interface Product extends IBase {
  name: string;
  price: number;
  image: string;
  orderItems?: OrderItem[];
}
