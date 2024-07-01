import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { GiPopcorn } from "react-icons/gi";
import { IoTicket } from "react-icons/io5";
import { useLoaderData, useLocation } from "react-router-dom";
import { Movie } from "../entity/Movie";
import { PlaceOrder } from "../entity/PlaceOrder";
import { Product } from "../entity/Product";
import { Seat } from "../entity/Seat";
import { ShowTime } from "../entity/ShowTime";
import { useToast } from "../hooks/useToast";
import appfetch from "../lib/axios";
export type CheckoutFormProps = {
  movie: Movie;
  seats: Seat[];
  showTime: ShowTime;
  date: string | Date;
};

function Checkout() {
  const checkoutProps = useLocation().state as CheckoutFormProps;
  const products = useLoaderData() as Product[];
  if (!checkoutProps) {
    window.location.href = "/";
  }
  const { movie, seats, showTime, date } = checkoutProps;
  //Track selected combos and its amount
  const [selectedProducts, setSelectedProducts] = useState<{ [productId: string]: number }>(); //Track selected combos and its amount
  //Exm: {'combo1': 3, 'combo2': 1}
  console.log(
    `${selectedProducts}: [${products
      .filter((p) => selectedProducts?.[p.id ?? p.name] !== undefined)
      .map((p) => p.name)
      .join(", ")}]`
  );

  const { isLoading, data: token } = useQuery(["token"], async () => {
    const res = await appfetch.get("/Authen/token", {
      withCredentials: true,
    });
    if (res.status === 200) {
      const data = await res.data;
      return data;
    } else if (res.status === 401) {
      throw new Error("Unauthorized");
    }
  });
  const addCombo = useCallback((product: Product) => {
    //If selectedCombos is not null, add product to it
    setSelectedProducts((prev) => {
      const updated = prev ? { ...prev } : {};
      const key = product.id ?? product.name;

      if (updated[key]) {
        updated[key] = (updated[key] || 0) + 1;
      } else {
        updated[key] = 1;
      }
      return updated;
    });
  }, []);

  const removeCombo = useCallback((product: Product) => {
    //If selectedCombos is not null, remove product from it
    setSelectedProducts((prev) => {
      const updated = prev ? { ...prev } : {};
      const key = product.id ?? product.name;
      if (updated[key]) {
        updated[key] -= 1;
      }
      if (updated[key] === 0) {
        delete updated[key];
      }
      return updated;
    });
  }, []);

  const totalMoney = useMemo(() => {
    let total = 0;
    //Calculate total money
    if (selectedProducts) {
      Object.keys(selectedProducts).forEach((productId) => {
        const product = products.find((product) => product.id === productId);
        if (product) {
          total += product.price * (selectedProducts[productId] || 0);
        }
      });
    }

    //Add seats price
    total += seats.length * 80000;
    return total;
  }, [selectedProducts]);
  const { addToast } = useToast();
  async function placeOrder() {
    //If no seats selected nor showtime selected, return
    if (!seats.length || !showTime) return;
    //Convert selected products to products array
    let products: {
      productId: string;
      quantity: number;
    }[];
    if (!selectedProducts) {
      products = [];
    } else {
      products = Object.keys(selectedProducts).map((productId) => ({
        productId,
        quantity: selectedProducts[productId] || 0,
      }));
    }

    const order: PlaceOrder = {
      products,
      tickets: {
        showTimeId: showTime.id || "",
        tickets:
          seats.map((seat) => ({
            seatNumber: seat.seatNumber.toString(),
            seatRow: seat.rowName,
          })) || [],
      },
    };

    //Post order to server
    try {
      const res = await appfetch.post(
        "/Tickets/placeOrder",
        {
          ...order,
        },
        {}
      );
      if (res.status === 200) {
        //Copy order id to clipboard
        navigator.clipboard.writeText(res.data.order.Id);
        addToast({
          title: "Đặt vé thành công",
          message: `Mã đơn hàng của bạn là ${res.data.order.Id}, đã được copy vào clipboard. Sau 3 giây trang sẽ tự động chuyển hướng về trang chủ`,
          type: "success",
          id: "place-order-success",
        });
        console.log(res);
      } else {
        alert("Đặt vé thất bại");
      }
    } catch (e) {
      addToast({
        title: "Đặt vé thất bại",
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: "error",
        id: "place-order-error",
      });
      console.log(e);
    }

    //navigate to home after 3 seconds
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }

  return (
    <div className="container mx-auto bg-base-300 h-screen grid grid-cols-12 gap-3">
      {/* Combo popcorn and drinks*/}
      <div className="bg-base-100 px-4 py-5 col-span-8 w-full grid grid-cols-2 text-sm lg:text-base">
        <section className="col-span-2">
          <h2 className="text-lg font-bold my-3 flex gap-2 items-center">
            <GiPopcorn />
            BẮP VÀ NƯỚC
          </h2>
          <div className="divider divider-horizontal h-[0.05rem] bg-base-content/40 space-y-3 my-3 w-full" />
          <div className="grid grid-cols-3 gap-4 max-h-[50vh] max-w-full overflow-auto snap-y whitespace-nowrap snap-mandatory snap-start">
            {products.map((product) => (
              <div
                key={product.name}
                className={
                  "bg-base-300 px-3 py-2 rounded-md flex items-center justify-between cursor-pointer col-span-3 lg:col-span-1"
                }
              >
                <div className="w-full">
                  <img
                    className="w-full object-cover aspect-square max-w-full"
                    src={product.image}
                    alt={product.name}
                  />
                  <h3
                    className="font-bold flex justify-between
                    w-full whitespace-pre-wrap my-2
                  "
                  >
                    <span>{product.name}</span>
                    <span>{product.price}</span>
                  </h3>

                  <div className="divider-horizontal vertical divider bg-base-content/40 w-[0.05rem] rounded-full" />
                  <div className="flex justify-between items-center">
                    <button
                      className="bg-base-content p-2 rounded-full text-base-300 active:scale-95 transition-all duration-200 active:bg-base-content/80"
                      onClick={() => addCombo(product)}
                    >
                      <FiPlus />
                    </button>
                    <h6>{selectedProducts && selectedProducts[product.id || product.name]}</h6>
                    <button
                      className="bg-base-content p-2 rounded-full text-base-300 active:scale-95 transition-all duration-200 active:bg-base-content/80"
                      onClick={() => removeCombo(product)}
                    >
                      <FiMinus />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="md:col-span-2">
          <h2 className="text-lg font-bold my-3 uppercase flex gap-2 items-center">
            <IoTicket />
            Thông tin vé {isLoading && "...loading"} - {token && token.data}
          </h2>
          <div className="divider divider-horizontal h-[0.05rem] bg-base-content/40 space-y-3 my-3 w-full" />
          <div className="bg-base-300 px-3 py-2 rounded-md flex items-center justify-between cursor-pointer ">
            <section className="flex justify-between w-full text-xs lg:text-base ">
              <span>Ngày chiếu</span>
              <h3 className="font-bold">
                <span>
                  {new Date(showTime.startTime as string).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </h3>
            </section>

            <div className="divider-horizontal vertical divider bg-base-content/40 w-[0.05rem] rounded-full" />
            <section className="flex justify-between w-full text-xs lg:text-base ">
              <span>Giờ chiếu</span>
              <h3 className="font-bold">
                <span>{`${new Date(showTime.startTime as string).getHours()}:${new Date(
                  showTime.endTime as string
                ).getMinutes()}`}</span>
              </h3>
            </section>

            <div className="divider-horizontal vertical divider bg-base-content/40 w-[0.05rem] rounded-full" />
            <section className="flex justify-between w-full text-sm lg:text-base ">
              <span>Phòng chiếu</span>
              <h3 className="font-bold">
                <span>{showTime.roomNumberId}</span>
              </h3>
            </section>
          </div>
        </section>
      </div>
      {/* Details */}
      <div className="bg-secondary-focus/80 text-white px-4 py-5 col-span-4 w-full">
        <article className="mx-auto text-center flex justify-center items-center flex-col">
          <img src={`${movie.posterPath}`} alt={movie.title} className="w-36" />
          <h2 className="text-lg font-bold">{movie.title}</h2>
          <div className="divider divider-horizontal h-[0.05rem] bg-base-content/40 space-y-3 my-3 w-full" />
          <div className="w-full space-y-3 font-semibold">
            {seats.map((seat) => (
              <div className="flex justify-between" key={seat.id}>
                <p>{seat.id}</p>
                <p>80.000</p>
              </div>
            ))}
          </div>
          <div className="w-full space-y-3 font-semibold">
            {
              //Render selected combos
              selectedProducts &&
                Object.keys(selectedProducts).map((productId) => (
                  <div className="flex justify-between" key={productId}>
                    <p className="text-start">
                      {
                        //get name of product
                        products.find((product) => product.id === productId)?.name
                      }
                      (x{selectedProducts[productId]})
                    </p>
                    <p>
                      {
                        //get total price of product
                        (products.find((product) => product.id === productId)?.price as number).toLocaleString("vi-Vn")
                      }
                    </p>
                  </div>
                ))
            }
          </div>
          <div className="divider divider-horizontal h-[0.05rem] bg-base-content/40 space-y-3 my-3 w-full" />
          <div className="flex justify-between w-full font-bold">
            <h3>Tổng tiền</h3>
            <p>
              {totalMoney.toLocaleString("vi-VN")} <span>đ</span>
            </p>
          </div>

          <div></div>

          <button
            className="btn btn-primary w-full rounded-full my-4 btn-sm"
            onClick={() => {
              placeOrder();
            }}
          >
            {/* <Link to="/payment"> */}
            Thanh toán bằng <span className="text-bold text-error">VNPAY</span>
            {/* </Link> */}
          </button>
        </article>
      </div>
    </div>
  );
}

export default Checkout;
