import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { IoArrowBack, IoCheckmark, IoRemove } from "react-icons/io5";
import { TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Customer } from "../../entity/Customer";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

type Props = {};

function CustomerPage({}: Props) {
  const { data: customers, isLoading } = useQuery<Customer[]>(["customers"], async () => {
    const res = await appfetch.get<Customer[], AxiosResponse<Customer[]>>("/Customers");

    return res.data;
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  const removeOrder = useMutation<Customer, Error, Customer>(
    async (order) => {
      const res = await appfetch.delete(`/Customers/${order.id}`);
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
        queryClient.invalidateQueries(["customers"]);
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

          <h3 className="">Quản lý khách hàng</h3>
        </div>
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full max-h-[80vh] block">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Confirmed Email</th>
              <th className="px-4 py-2">Date of birth</th>
              <th className="px-4 py-2">Point</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Join at</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="">
            {isLoading && (
              <tr className="animate-pulse">
                {/* Span all columns */}
                <td className="border border-base-300 px-4 py-12 font-bold text-center text-lg" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {customers &&
              customers.map((cus, index) => (
                <tr key={cus.id}>
                  <td className="border border-base-300 px-4 py-2">
                    <span className="font-bold">{index + 1}</span>
                  </td>
                  <td className="border border-base-300 px-4 py-2">{cus.name}</td>
                  <td className="border border-base-300 px-4 py-2">{cus.email}</td>
                  <td className="border border-base-300 px-4 py-2">
                    {cus.emailConfirm ? (
                      <IoCheckmark className="text-green-500" />
                    ) : (
                      <IoRemove className="text-red-500" />
                    )}
                  </td>
                  <td className="border border-base-300 px-4 py-2">{cus.dob}</td>
                  <td className="border border-base-300 px-4 py-2">{cus.point}</td>
                  <td className="border border-base-300 px-4 py-2">{cus.phoneNumber}</td>
                  <td>
                    {
                      //Covert iso date to local date
                      cus.createAt && new Date(cus.createAt.split("T")[0]).toLocaleDateString("vi-VN" /*, options*/)
                    }
                  </td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => removeOrder.mutate(cus)}
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
                  <p>{customers && customers.length}</p>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default CustomerPage;
