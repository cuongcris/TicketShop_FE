import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import React from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { TbEditCircle, TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Employee } from "../../entity/Employee";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

function EmployeePage() {
  const [seletedEmployee, setSeletedEmployee] = React.useState<Employee>({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    dob: "",
    startDate: "",
  });
  const { data: employees, isLoading } = useQuery(["employee"], getEmployees);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  function setEmployee(employee: Employee) {
    setSeletedEmployee(employee);
    setIsDialogOpen(true);
  }
  const { addToast } = useToast();
  const deleteEmployee = useMutation(
    async (id: string) => {
      const res = await appfetch.delete(`/Employees/${id}`);
      return id;
    },
    {
      onSuccess: (id) => {
        addToast({
          title: "Success",
          message: `Nhân viên ${seletedEmployee.name} đã được xóa khỏi hệ thống`,
          type: "success",
          id: "delete-employee-success",
        });
        queryClient.setQueryData(["employee"], (oldData: any) => {
          return oldData.filter((employee: Employee) => employee.id !== id);
        });
      },
      onError: (error) => {
        addToast({
          title: "Error",
          message: "Có lỗi xảy ra, kiểm tra log để biết thêm chi tiết",
          type: "error",
          id: "delete-employee-error",
        });
        console.error(error);
      },
    }
  );
  const navigate = useNavigate();

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

          <h3 className="">Quản lý nhân viên</h3>
        </div>
        <AddEmployeeDialog />
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Address</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="animate-pulse">
                {/* Span all columns */}
                <td className="border border-base-300 px-4 py-12 font-bold text-center text-lg" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {employees &&
              employees.map((employee, index) => (
                <tr key={employee.id}>
                  <td className="border border-base-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-base-300 px-4 py-2">{employee.name}</td>
                  <td className="border border-base-300 px-4 py-2">{employee.email}</td>
                  <td className="border border-base-300 px-4 py-2">{employee.phoneNumber}</td>
                  <td className="border border-base-300 px-4 py-2">{employee.address}</td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-primary btn-circle btn-ghost text-primary hover:text-white hover:bg-primary text-xl"
                      onClick={() => setEmployee(employee)}
                    >
                      <TbEditCircle />
                    </button>
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => deleteEmployee.mutate(employee.id!)}
                    >
                      <TbTrashXFilled />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6}>
                <div className="flex justify-end gap-5">
                  <h3>Tổng số: </h3>
                  <p>{employees && employees.length}</p>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <UpdateEmployeeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} employee={seletedEmployee} />
    </div>
  );
}
type EmployeeDialogProps = {
  employee: Employee;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type PostEmployee = {
  cid: string;
  name: string;
  dob: string; //Date only
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
  startDate: string; //Date only
};

function AddEmployeeDialog() {
  const { addToast } = useToast();

  const addEmployee = useMutation(
    (data: PostEmployee) => appfetch.post<PostEmployee, AxiosResponse<Employee>>("/Employees", data),
    {
      onSuccess: (data) => {
        const { id, name, email, phoneNumber, address, dob, startDate } = data.data;
        addToast({
          title: "Success",
          message: `Nhân viên ${name} đã được thêm vào hệ thống`,
          type: "success",
          id: "add-employee-success",
        });
        queryClient.setQueryData(["employee"], (oldData: any) => {
          return [...oldData, { id, name, email, phoneNumber, address, dob, startDate }];
        });
      },
      onError: (error) => {
        addToast({
          title: "Error",
          message: "Thông tin có thể bị trùng, kiểm tra log để biết thêm chi tiết",
          type: "error",
          id: "add-employee-error",
        });
        console.log("Error: ", error);
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    const name = e.currentTarget.name.value;
    const cid = e.currentTarget.cid.value;
    const email = e.currentTarget.email.value;
    const phoneNumber = e.currentTarget.phoneNumber.value;
    const address = e.currentTarget.address.value;
    const position = e.currentTarget.position.value;
    const raw_dob = e.currentTarget.dob.value;
    const raw_startDate = new Date().toISOString();
    //Take only the date part
    const dob = new Date(raw_dob).toISOString().split("T")[0];
    const startDate = raw_startDate.split("T")[0];

    const data = {
      cid,
      name,
      dob,
      email,
      phoneNumber,
      address,
      position,
      startDate,
    };

    console.log("...Adding employee with data: ", data);
    addEmployee.mutate(data);
  }
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-base-300/50" />
      <Dialog.Trigger asChild>
        <button
          className="btn btn-info btn-square text-lg"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <IoAdd />
        </button>
      </Dialog.Trigger>
      <Dialog.DialogPortal>
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[50vw] translate-x-[-50%] translate-y-[-50%] rounded-md bg-base-100 px-4 py-2 focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">"Thêm nhân viên"</Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text">Name</span>
            </label>
            <input id={"name"} type="text" placeholder="Name" className="input input-bordered" name={"name"} required />

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="cid">
                  <span className="label-text">CCCD</span>
                </label>
                <input id={"cid"} type="text" placeholder="" className="input input-bordered" name="cid" required />
              </div>

              <div>
                <label className="label" htmlFor="position">
                  <span className="label-text">Vị trí</span>
                </label>
                <input
                  id={"position"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="position"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Email</span>
                </label>
                <input id={"email"} type="text" placeholder="Email" className="input input-bordered" name="email" />
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  <span className="label-text">Số điện thoại</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"phoneNumber"}
                  required
                  name="phoneNumber"
                />
              </div>
            </div>

            <label className="label" htmlFor="dob">
              <span className="label-text">Ngày sinh</span>
            </label>
            <input
              type="date"
              placeholder="--/--/----"
              className="input input-bordered"
              id={"dob"}
              name="dob"
              required
            />

            <label htmlFor="address" className="label">
              <span className="label-text">Địa chỉ</span>
            </label>
            <textarea
              id={"address"}
              placeholder="Address"
              className="textarea h-24 textarea-bordered"
              name="address"
              required
            />

            <div className="mt-4 flex gap-5">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="reset"
                className="btn btn-error btn-ghost"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.DialogPortal>
    </Dialog.Root>
  );
}

export function UpdateEmployeeDialog({ employee, isOpen, onOpenChange }: EmployeeDialogProps) {
  const { addToast } = useToast();
  const updateEmployee = useMutation(
    (data: any) => appfetch.put<PostEmployee, AxiosResponse<Employee>>(`/Employees/${employee?.id}`, data),
    {
      onSuccess: (data) => {
        const employee = data.data;

        addToast({
          title: "Cập nhật nhân viên thành công",
          message: `Nhân viên ${employee.name} đã được cập nhật thành công`,
          type: "success",
          id: "update-employee-success",
        });
        queryClient.setQueryData(["employee"], (oldData: Employee[] | any) => {
          //replace the old employee with the new one
          return oldData.map((oldEmployee: Employee) => {
            if (oldEmployee.id === employee.id) {
              return employee;
            }
            return oldEmployee;
          });
        });
      },
      onError: (error) => {
        addToast({
          title: "Cập nhật nhân viên thất bại",
          message: `Nhân viên ${employee.name} không thể được cập nhật, kiểm tra log để biết thêm chi tiết`,
          type: "error",
          id: "update-employee-error",
        });
        console.error("...Error updating employee", employee.id, " with data: ", error);
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    const name = e.currentTarget.name.value;
    const cid = e.currentTarget.cid.value;
    const email = e.currentTarget.email.value;
    const phoneNumber = e.currentTarget.phoneNumber.value;
    const address = e.currentTarget.address.value;
    const position = e.currentTarget.position.value;
    const raw_dob = e.currentTarget.dob.value;
    const raw_startDate = e.currentTarget.startDate.value;
    //Take only the date part
    const dob = new Date(raw_dob).toISOString().split("T")[0];
    const startDate = new Date(raw_startDate).toISOString().split("T")[0];

    const data = {
      cid,
      name,
      dob,
      email,
      phoneNumber,
      address,
      position,
      startDate,
    };
    console.log("...Updating employee", employee.id, " with data: ", data);
    updateEmployee.mutate(data);
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-base-300/50" />
      <Dialog.DialogPortal>
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[50vw] translate-x-[-50%] translate-y-[-50%] rounded-md bg-base-100 px-4 py-2 focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">
            {employee ? "Edit Employee" : "Add Employee"}
          </Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text">Name</span>
            </label>
            <input
              id={"name"}
              type="text"
              placeholder="Name"
              className="input input-bordered"
              name={"name"}
              required
              defaultValue={employee?.name}
            />

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="cid">
                  <span className="label-text">CCCD</span>
                </label>
                <input
                  id={"cid"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="cid"
                  required
                  defaultValue={employee?.cid}
                />
              </div>

              <div>
                <label className="label" htmlFor="position">
                  <span className="label-text">Vị trí</span>
                </label>
                <input
                  id={"position"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="position"
                  required
                  defaultValue={employee?.position}
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id={"email"}
                  type="text"
                  placeholder="Email"
                  className="input input-bordered"
                  name="email"
                  defaultValue={employee?.email}
                />
              </div>

              <div>
                <label className="label" htmlFor="phone">
                  <span className="label-text">Số điện thoại</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"phoneNumber"}
                  required
                  name="phoneNumber"
                  defaultValue={employee?.phoneNumber}
                />
              </div>
            </div>

            <label className="label" htmlFor="dob">
              <span className="label-text">Ngày sinh</span>
            </label>
            <input
              type="date"
              placeholder="--/--/----"
              className="input input-bordered"
              id={"dob"}
              name="dob"
              defaultValue={employee?.dob ? new Date(employee?.dob).toISOString().split("T")[0] : ""}
              required
            />

            <label className="label" htmlFor="startDate">
              <span className="label-text">Bắt đầu làm việc</span>
            </label>
            <input
              type="date"
              placeholder="--/--/----"
              className="input input-bordered"
              id={"startDate"}
              name="startDate"
              defaultValue={employee?.startDate ? new Date(employee?.startDate).toISOString().split("T")[0] : ""}
              required
            />

            <label htmlFor="address" className="label">
              <span className="label-text">Địa chỉ</span>
            </label>
            <textarea
              id={"address"}
              placeholder="Address"
              className="textarea h-24 textarea-bordered"
              name="address"
              defaultValue={employee?.address}
              required
            />

            <div className="mt-4 flex gap-5">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="reset"
                className="btn btn-error btn-ghost"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.DialogPortal>
    </Dialog.Root>
  );
}

export default EmployeePage;

//Loader
export async function getEmployees() {
  const res = await appfetch<Employee[]>("/Employees");
  return res.data;
}
