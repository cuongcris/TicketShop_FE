import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { IoArrowBack, IoCheckmark, IoRemove } from "react-icons/io5";
import { TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Order } from "../../entity/Order";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

type Props = {};

function TicketsPage({}: Props) {
  const { data: orders, isLoading } = useQuery<Order[]>(["orders"], async () => {
    const res = await appfetch.get<Order[], AxiosResponse<Order[]>>("/Orders");

    return res.data;
  });
  const navigate = useNavigate();
  const { addToast } = useToast();

  const removeOrder = useMutation<Order, Error, Order>(
    async (order) => {
      const res = await appfetch.delete(`/Orders/${order.id}`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        addToast({
          title: "Xóa thành công",
          type: "success",
          message: `Đã xóa thành công`,
          id: "remove-order",
        });
        //Remove from cache
        queryClient.invalidateQueries(["orders"]);
      },

      onError: (error) => {
        addToast({
          title: "Xóa thất bại",
          type: "error",
          message: `Đã xảy ra lỗi khi xóa`,
          id: "remove-order",
        });
      },
    }
  );

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center my-5">
        <div className="text-2xl font-medium leading-3 flex gap-2">
          <span
            className="cursor-pointer"
            onClick={() => {
              navigate(-1);
            }}
          >
            <IoArrowBack />
          </span>

          <h3 className="">Quản lý Order</h3>
        </div>
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full max-h-[80vh] block">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Ticket Amount</th>
              <th className="px-4 py-2">Customer email</th>
              <th className="px-4 py-2">Seats</th>
              <th className="px-4 py-2">Products</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="">
            {isLoading && (
              <tr className="animate-pulse">
                {/* Span all columns */}
                <td className="border border-base-300 px-4 py-12 font-bold text-center text-lg" colSpan={9}>
                  Loading...
                </td>
              </tr>
            )}
            {orders &&
              orders.map((order, index) => (
                <tr key={order.id}>
                  <td className="border border-base-300 px-4 py-2">
                    <span
                      className="font-bold 
                      whitespace-nowrap max-w-sm overflow-hidden overflow-ellipsis"
                    >
                      {order.id}
                    </span>
                  </td>
                  <td className="border border-base-300 px-4 py-2">{order.tickets?.length}</td>
                  <td className="border border-base-300 px-4 py-2">{order.customer?.email}</td>
                  <td className="border border-base-300 px-4 py-2">
                    {order.tickets?.map((ticket, index) => (
                      <span key={ticket.id}>
                        {ticket.seat?.rowName}
                        {ticket.seat.seatNumber}
                        {order.tickets && index < order.tickets?.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </td>
                  <td className="border border-base-300 px-4 py-2">
                    {order.orderItems && order.orderItems?.length > 0
                      ? order.orderItems?.map((item, index) => (
                          <span key={item.id}>
                            {item.product?.name}x{item.quantity + ", "}
                          </span>
                        ))
                      : "--"}
                  </td>
                  <td className="border border-base-300 px-4 py-2">
                    {order.status ? <IoCheckmark className="text-green-500" /> : <IoRemove className="text-red-500" />}
                  </td>
                  <td className="border border-base-300 px-4 py-2">{order.total?.toLocaleString("vn-VI") + " VND"}</td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => removeOrder.mutate(order)}
                    >
                      <TbTrashXFilled />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={9}>
                <div className="flex justify-end gap-5">
                  <h3>Tổng số: </h3>
                  <p>{orders && orders.length}</p>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default TicketsPage;
