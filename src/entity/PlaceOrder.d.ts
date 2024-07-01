export interface PlaceOrder {
  products: {
    productId: string;
    quantity: number;
  }[];
  tickets: {
    showTimeId: string;
    tickets: {
      seatRow: string;
      seatNumber: string;
    }[];
  };
}
