import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import React from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { TbEditCircle, TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Product } from "../../entity/Product";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

export default function ProductPage() {
  const [selectedProduct, setSelectedProdcut] = React.useState<Product | null>();
  const { data: movies, isLoading } = useQuery<Product[]>(["products"], async () => {
    const res = await appfetch<Product[]>("/Products");
    const products = res.data;
    if (!products) throw new Error("Not found");
    return products;
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  function setProduct(product: Product) {
    setSelectedProdcut(product);
    setIsDialogOpen(true);
  }
  const { addToast } = useToast();

  const removeProduct = useMutation(
    async (product: Product) => {
      try {
        const res = await appfetch<Product, AxiosResponse<Product>>(`/Products/${product.id}`, {
          method: "DELETE",
        });

        return product;
      } catch (error: any) {
        //If status code is 204, return the movie
        console.log("error response: ", error);

        if (error.response.status === 204) {
          return product;
        }
        throw error;
      }
    },
    {
      onSuccess(data) {
        addToast({
          title: "Success",
          message: `Xoá sản phẩm ${data.name} thành công`,
          type: "success",
          id: "delete-movie-success",
        });

        const product = data;
        queryClient.setQueryData(["products"], (oldData: any) => {
          return oldData.filter((m: Product) => m.id !== product.id);
        });
      },
      onError(error, product, _) {
        console.error(error);
        addToast({
          title: "Error",
          message: `Lỗi khi xoá sản phẩm ${product.name}, kiểm tra log để biết thêm chi tiết`,
          type: "error",
          id: "delete-movie-error",
        });
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

          <h3 className="">Quản lý Sản phẩm</h3>
        </div>
        <AddMovieDialog />
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full max-h-[80vh] block">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
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
            {movies &&
              movies.map((product, index) => (
                <tr key={product.id}>
                  <td className="border border-base-300 px-4 py-2">
                    <img className="aspect-square max-h-28 object-cover mx-auto " src={product.image} alt="" />
                  </td>
                  <td className="border border-base-300 px-4 py-2">{product.name}</td>
                  <td className="border border-base-300 px-4 py-2">{product.price}</td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-primary btn-circle btn-ghost text-primary hover:text-white hover:bg-primary text-xl"
                      onClick={() => setProduct(product)}
                    >
                      <TbEditCircle />
                    </button>
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => removeProduct.mutate(product)}
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
                  <p>{movies && movies.length}</p>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <UpdateMovieDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} movie={selectedProduct!} />
    </div>
  );
}

type MovieDialogProps = {
  movie: Product | null;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type PostProduct = {
  name: string;
  price: number;
  image: string;
};

function AddMovieDialog() {
  const { addToast } = useToast();

  const addProduct = useMutation(
    (product: PostProduct) => appfetch.post<PostProduct, AxiosResponse<Product>>("/Products", { ...product }),
    {
      onSuccess: (data) => {
        const product = data.data;
        addToast({
          title: "Thành công",
          message: `Thêm thành công phim ${product.name}`,
          type: "success",
          id: "add-movie-success",
        });
        queryClient.setQueryData(["products"], (oldData: any) => {
          return [...oldData, product];
        });
      },
      onError: (error) => {
        addToast({
          title: "Error",
          message: "Thông tin có thể bị trùng, kiểm tra log để biết thêm chi tiết",
          type: "error",
          id: "add-movie-error",
        });
        console.log("Error: ", error);
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    const movie: PostProduct = {
      price: Number(e.target.price.value),
      name: e.target.name.value,
      image: e.target.image.value,
    };
    addProduct.mutate(movie);
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
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[50vw] translate-x-[-50%] translate-y-[-50%] rounded-md bg-base-100 px-4 py-2 focus:outline-none overflow-auto">
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">Thêm sản phẩm</Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="form-control">
            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input id={"name"} type="text" placeholder="" className="input input-bordered" name="name" required />
              </div>

              <div>
                <label className="label" htmlFor="Image">
                  <span className="label-text">Image</span>
                </label>
                <input id={"image"} type="text" placeholder="" className="input input-bordered" name="image" required />
              </div>

              <div>
                <label htmlFor="price" className="label">
                  <span className="label-text">Price</span>
                </label>
                <input id={"price"} type="number" placeholder="2300000" className="input input-bordered" name="price" />
              </div>
            </div>

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
export function UpdateMovieDialog({ movie: product, isOpen, onOpenChange }: MovieDialogProps) {
  const { addToast } = useToast();
  const update = useMutation(
    (data: any) => appfetch.put<PostProduct, AxiosResponse<Product>>(`/Products/${product?.id}`, data),
    {
      onSuccess: (data) => {
        const prodcut = data.data;

        addToast({
          title: "Cập nhật phim thành công",
          message: `Sản phẩm ${prodcut.name} đã được cập nhật thành công`,
          type: "success",
          id: "update-movie-success",
        });
        queryClient.setQueryData<Product[]>(["products"], (oldData) => {
          if (!oldData) return;

          const index = oldData.findIndex((m) => m.id === prodcut.id);

          if (index !== -1) {
            oldData[index] = prodcut;
          }

          return oldData;
        });
      },
      onError: (error) => {
        addToast({
          title: "Cập nhật phim thất bại",
          message: `Sản phẩm ${product?.name} không thể được cập nhật, kiểm tra log để biết thêm chi tiết`,
          type: "error",
          id: "update-movie-error",
        });
        console.error("...Error updating movie", product?.name, " with data: ", error);
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    //Checkbox adult

    const product: PostProduct = {
      name: e.target.name.value,
      price: Number(e.target.price.value),
      image: e.target.image.value,
    };
    console.log("...Updating movie", product.name, " with data: ", product);
    update.mutate(product);
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-base-300/50" />
      <Dialog.DialogPortal>
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh]  max-w-[50vw] translate-x-[-50%] translate-y-[-50%] rounded-md bg-base-100 px-4 py-2 focus:outline-none overflow-y-auto">
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">Chỉnh sửa</Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>

          <form onSubmit={onSubmit}>
            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input
                  id={"name"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="name"
                  required
                  defaultValue={product?.name}
                />
              </div>
              <div>
                <label className="label" htmlFor="Image">
                  <span className="label-text">Image</span>
                </label>
                <input
                  id={"image"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="image"
                  required
                  defaultValue={product?.image}
                />
              </div>

              <div>
                <label htmlFor="price" className="label">
                  <span className="label-text">Price</span>
                </label>
                <input
                  id={"price"}
                  type="number"
                  placeholder="2300000"
                  className="input input-bordered"
                  name="price"
                  defaultValue={product?.price}
                />
              </div>
            </div>

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
