import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import React from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { TbEditCircle, TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Movie } from "../../entity/Movie";
import { ShowTime } from "../../entity/ShowTime";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

export default function ShowTimePage() {
  const [selectedProduct, setSelectedProdcut] = React.useState<ShowTime | null>();
  const { data: showTimes, isLoading } = useQuery(["showtime"], async () => {
    const res = await appfetch<ShowTime[]>("/ShowTimes");
    //Get movies from response movieId
    const movieIds = res.data.map((showtime) => showtime.movieId);

    const movies = await Promise.all(
      movieIds.map(async (movieId) => {
        const res = await appfetch.get<Movie, AxiosResponse<Movie>>(`/Movies/${movieId}`);
        return res.data;
      })
    );
    //Add movie to showtime
    const showTimes = res.data.map((showtime) => {
      const movie = movies.find((movie) => movie.id === showtime.movieId);
      return {
        ...showtime,
        movie,
      };
    });

    if (!showTimes) throw new Error("Not found");
    return showTimes;
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  function setST(showtime: ShowTime) {
    setSelectedProdcut(showtime);
    setIsDialogOpen(true);
  }
  const { addToast } = useToast();

  const removeProduct = useMutation(
    async (id: string) => {
      try {
        const res = await appfetch<ShowTime, AxiosResponse<ShowTime>>(`/ShowTimes/${id}`, {
          method: "DELETE",
        });

        return id;
      } catch (error: any) {
        //If status code is 204, return the movie
        console.log("error response: ", error);

        if (error.response.status === 204) {
          return id;
        }
        throw error;
      }
    },
    {
      onSuccess(data) {
        addToast({
          title: "Success",
          message: `Xoá thành công`,
          type: "success",
          id: "delete-movie-success",
        });

        const product = data;
        queryClient.setQueryData(["showtime"], (oldData: any) => {
          return oldData.filter((m: ShowTime) => m.id !== product);
        });
      },
      onError(error) {
        console.error(error);
        addToast({
          title: "Error",
          message: `Lỗi khi xoá , kiểm tra log để biết thêm chi tiết`,
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

          <h3 className="">Quản lý lịch chiếu</h3>
        </div>
        <AddMovieDialog />
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full max-h-[80vh] block">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Phim</th>
              <th className="px-4 py-2">Phòng</th>
              <th className="px-4 py-2">Bắt đầu</th>
              <th className="px-4 py-2">Kết thúc</th>
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
            {showTimes &&
              showTimes.map((showtime, index) => (
                <tr key={showtime.id}>
                  <td className="border border-base-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-base-300 px-4 py-2">{showtime.movie?.title}</td>
                  <td className="border border-base-300 px-4 py-2">{showtime.roomNumberId}</td>
                  <td className="border border-base-300 px-4 py-2">{showtime.startTime}</td>
                  <td className="border border-base-300 px-4 py-2">{showtime.endTime}</td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-primary btn-circle btn-ghost text-primary hover:text-white hover:bg-primary text-xl"
                      onClick={() => setST(showtime)}
                    >
                      <TbEditCircle />
                    </button>
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => removeProduct.mutate(showtime.id || "")}
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
                  <p>{showTimes && showTimes.length}</p>
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
  movie: ShowTime | null;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type PostProduct = {
  movieId: string;
  roomNumberId: number;
  startTime: string;
};

function AddMovieDialog() {
  const { addToast } = useToast();

  const addProduct = useMutation(
    (product: PostProduct) => appfetch.post<PostProduct, AxiosResponse<ShowTime>>("/ShowTimes", { ...product }),
    {
      onSuccess: (data) => {
        const product = data.data;
        addToast({
          title: "Thành công",
          message: `Thêm thành công `,
          type: "success",
          id: "add-movie-success",
        });
        queryClient.invalidateQueries(["showtime"]);
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
    let startTime = e.target.startTime.value;
    //Convert to ISOString
    startTime = new Date(startTime).toISOString();
    const movie: PostProduct = {
      movieId: e.target.movieId.value,
      roomNumberId: e.target.roomNumberId.value,
      startTime: startTime,
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
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">Thêm lich chieu</Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="form-control">
            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="movieId">
                  <span className="label-text">movieId</span>
                </label>
                <input
                  id={"movieId"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="movieId"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="roomNumberId">
                  <span className="label-text">room number id</span>
                </label>
                <input
                  id={"roomNumberId"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="roomNumberId"
                  required
                />
              </div>

              <div>
                <label htmlFor="startTime" className="label">
                  <span className="label-text">Start time</span>
                </label>
                <input id={"startTime"} type="datetime-local" className="input input-bordered" name="startTime" />
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
    (data: any) => appfetch.put<PostProduct, AxiosResponse<ShowTime>>(`/ShowTimes/${product?.id}`, data),
    {
      onSuccess: (data) => {
        const prodcut = data.data;

        addToast({
          title: "Cập nhật thành công",
          message: `Được cập nhật thành công`,
          type: "success",
          id: "update-movie-success",
        });
        queryClient.invalidateQueries(["showtime"]);
      },
      onError: (error) => {
        addToast({
          title: "Cập nhật phim thất bại",
          message: `không thể được cập nhật, kiểm tra log để biết thêm chi tiết`,
          type: "error",
          id: "update-movie-error",
        });
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    //Checkbox adult

    const product: PostProduct = {
      movieId: e.target.movieId.value,
      roomNumberId: e.target.roomNumberId.value,
      startTime: e.target.startTime.value,
    };
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
                  <span className="label-text">Movie id</span>
                </label>
                <input
                  id={"movieId"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="movieId"
                  required
                  defaultValue={product?.movieId}
                />
              </div>
              <div>
                <label className="label" htmlFor="Image">
                  <span className="label-text">Room number</span>
                </label>
                <input
                  id={"roomNumberId"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="roomNumberId"
                  required
                  defaultValue={product?.roomNumberId}
                />
              </div>

              <div>
                <label htmlFor="startTime" className="label">
                  <span className="label-text">StartTime</span>
                </label>
                <input
                  id={"startTime"}
                  type="datetime-local"
                  className="input input-bordered"
                  name="startTime"
                  defaultValue={
                    //Covert from ISO to local time
                    product?.startTime ? new Date(product?.startTime).toISOString().slice(0, 16) : undefined
                  }
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
