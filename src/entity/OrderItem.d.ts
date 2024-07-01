import { IBase } from "./Base";
import { Order } from "./Order";
import { Product } from "./Product";

export interface OrderItem extends IBase {
  orderId?: string;
  order?: Order;
  productId?: string;
  product?: Product;
  quantity?: number;
}
