import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import React from "react";
import { IoAdd, IoArrowBack, IoCheckmark, IoRemove } from "react-icons/io5";
import { TbEditCircle, TbTrashXFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Movie } from "../../entity/Movie";
import { useToast } from "../../hooks/useToast";
import appfetch from "../../lib/axios";
import { queryClient } from "../../main";

export default function MoviesPage() {
  const [selectedMovie, setSelectedMovie] = React.useState<Movie | null>();
  const { data: movies, isLoading } = useQuery<Movie[]>(["movies"], async () => {
    const res = await appfetch<Movie[]>("/Movies");
    const movies = res.data;
    if (!movies) throw new Error("Not found");
    return movies;
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  function setMovie(movie: Movie) {
    setSelectedMovie(movie);
    setIsDialogOpen(true);
  }
  const { addToast } = useToast();

  const removeMovie = useMutation(
    async (movie: Movie) => {
      try {
        const res = await appfetch<Movie, AxiosResponse<Movie>>(`/Movies/${movie.id}`, {
          method: "DELETE",
        });

        return movie;
      } catch (error: any) {
        //If status code is 204, return the movie
        console.log("error response: ", error);

        if (error.response.status === 204) {
          return movie;
        }
        throw error;
      }
    },
    {
      onSuccess(data) {
        addToast({
          title: "Success",
          message: `Xoá phim ${data.title} thành công`,
          type: "success",
          id: "delete-movie-success",
        });

        const movie = data;
        queryClient.setQueryData(["movies"], (oldData: any) => {
          return oldData.filter((m: Movie) => m.id !== movie.id);
        });
      },
      onError(error, movie, _) {
        console.error(error);
        addToast({
          title: "Error",
          message: `Lỗi khi xoá phim ${movie.title}, kiểm tra log để biết thêm chi tiết`,
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

          <h3 className="">Quản lý Phim</h3>
        </div>
        <AddMovieDialog />
      </div>
      <div className="overflow-y-auto">
        <table className="table table-zebra w-full max-h-[80vh] block">
          <thead>
            <tr>
              <th></th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Language</th>
              <th className="px-4 py-2">Adult</th>
              <th className="px-4 py-2">Runtime</th>
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
              movies.map((movie, index) => (
                <tr key={movie.id}>
                  <td className="border border-base-300 px-4 py-2">
                    <img className="aspect-square max-h-28 object-cover mx-auto " src={movie.posterPath} alt="" />
                  </td>
                  <td className="border border-base-300 px-4 py-2">{movie.title}</td>
                  <td className="border border-base-300 px-4 py-2">{movie.language}</td>
                  <td className="border border-base-300 px-4 py-2">
                    {movie.adult ? <IoCheckmark className="text-green-500" /> : <IoRemove className="text-red-500" />}
                  </td>
                  <td className="border border-base-300 px-4 py-2">{movie.runTime}</td>
                  <td className="border border-base-300 px-4 py-2">
                    <button
                      className="btn btn-primary btn-circle btn-ghost text-primary hover:text-white hover:bg-primary text-xl"
                      onClick={() => setMovie(movie)}
                    >
                      <TbEditCircle />
                    </button>
                    <button
                      className="btn btn-error hover:bg-error text-error hover:text-white btn-circle btn-ghost text-xl"
                      onClick={() => removeMovie.mutate(movie)}
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
      <UpdateMovieDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} movie={selectedMovie!} />
    </div>
  );
}

type MovieDialogProps = {
  movie: Movie | null;
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type PostMovie = {
  title: string;
  name: string;
  director: string;
  cast: string;
  genreId: string;
  language: string;
  releaseDate: string;
  runTime: string;
  tagline: string;
  homePage: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  adult: boolean;
  status: boolean;
  budget: number;
  revenue: number;
  vote_average: number;
  vote_count: number;
  video: boolean;
  popularity: number;
};

function AddMovieDialog() {
  const { addToast } = useToast();

  const addMovies = useMutation(
    (movie: PostMovie) => appfetch.post<PostMovie, AxiosResponse<Movie>>("/Movies", { ...movie }),
    {
      onSuccess: (data) => {
        const movie = data.data;
        addToast({
          title: "Thành công",
          message: `Thêm thành công phim ${movie.title}`,
          type: "success",
          id: "add-movie-success",
        });
        queryClient.setQueryData(["movies"], (oldData: any) => {
          return [...oldData, movie];
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
    const movie: PostMovie = {
      title: e.target.title.value,
      name: e.target.name.value,
      director: e.target.director.value,
      cast: e.target.cast.value,
      genreId: e.target.genreId ? e.target.genreId.value : "gen1",
      language: e.target.language.value,
      releaseDate: e.target.releaseDate.value,
      runTime: e.target.runTime.value,
      adult: e.target.adult.value === "on" ? true : false,
      status: e.target.status.value === "on" ? true : false,
      budget: e.target.budget.value,
      revenue: e.target.revenue.value,
      vote_average: e.target.vote_average.value,
      vote_count: e.target.vote_count.value,
      video: e.target.video.value === "on" ? true : false,
      popularity: e.target.popularity.value,
      tagline: e.target.tagline.value,
      homePage: e.target.homePage.value,
      overview: e.target.overview.value,
      posterPath: e.target.posterPath.value,
      backdropPath: e.target.backdropPath.value,
    };
    addMovies.mutate(movie);
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
          <Dialog.Title className="text-xl font-bold text-base-content mt-4">Thêm phim</Dialog.Title>
          <Dialog.Description className="text-sm font-medium text-gray-500">
            Click outside the dialog or press the Escape key to close it.
          </Dialog.Description>
          <form onSubmit={onSubmit} className="form-control">
            <label className="label" htmlFor="title">
              <span className="label-text">Title</span>
            </label>
            <input
              id={"title"}
              type="text"
              placeholder="Name"
              className="input input-bordered"
              name={"title"}
              required
            />

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input id={"name"} type="text" placeholder="" className="input input-bordered" name="name" required />
              </div>

              <div>
                <label className="label" htmlFor="director">
                  <span className="label-text">Director</span>
                </label>
                <input
                  id={"director"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="director"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label htmlFor="cast" className="label">
                  <span className="label-text">cast</span>
                </label>
                <input id={"cast"} type="text" placeholder="cast" className="input input-bordered" name="cast" />
              </div>

              <div>
                <label className="label" htmlFor="language">
                  <span className="label-text">Language</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"language"}
                  required
                  name="language"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5 items-center">
              <div>
                <label className="label" htmlFor="releaseDate">
                  <span className="label-text">releaseDate</span>
                </label>
                <input
                  type="date"
                  placeholder="--/--/----"
                  className="input input-bordered"
                  id={"releaseDate"}
                  name="releaseDate"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="runTime">
                  <span className="label-text" placeholder="">
                    runTime
                  </span>
                </label>
                <input
                  type="time"
                  placeholder=""
                  className="input input-bordered"
                  id={"runTime"}
                  required
                  name="runTime"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="status">
                  <span className="label-text">status</span>
                </label>
                <input type="checkbox" placeholder="" className="checkbox" id={"status"} name="status" />

                <label className="label" htmlFor="adult">
                  <span className="label-text">adult</span>
                </label>
                <input type="checkbox" placeholder="" className="checkbox" id={"adult"} name="adult" />
              </div>

              <div>
                <label className="label" htmlFor="budget">
                  <span className="label-text">budget</span>
                </label>
                <input
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"budget"}
                  required
                  name="budget"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="revenue">
                  <span className="label-text">revenue</span>
                </label>

                <input
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"revenue"}
                  required
                  name="revenue"
                />
              </div>

              <div>
                <label className="label" htmlFor="vote_average">
                  <span className="label-text">vote_average</span>
                </label>
                <input
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"vote_average"}
                  required
                  name="vote_average"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="vote_count">
                  <span className="label-text">vote_count</span>
                </label>
                <input
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"vote_count"}
                  required
                  name="vote_count"
                />
              </div>

              <div>
                <label className="label" htmlFor="video">
                  <span className="label-text">video</span>
                </label>
                <input type="checkbox" placeholder="" className="checkbox" id={"video"} name="video" />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="popularity">
                  <span className="label-text">popularity</span>
                </label>
                <input
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"popularity"}
                  required
                  name="popularity"
                />
              </div>

              <div>
                <label className="label" htmlFor="tagline">
                  <span className="label-text">tagline</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"tagline"}
                  required
                  name="tagline"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="homePage">
                  <span className="label-text">homePage</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"homePage"}
                  required
                  name="homePage"
                />
              </div>

              <div>
                <label className="label" htmlFor="overview">
                  <span className="label-text">overview</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"overview"}
                  required
                  name="overview"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="posterPath">
                  <span className="label-text">posterPath</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"posterPath"}
                  required
                  name="posterPath"
                />
              </div>

              <div>
                <label className="label" htmlFor="backdropPath">
                  <span className="label-text">backdropPath</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"backdropPath"}
                  required
                  name="backdropPath"
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
export function UpdateMovieDialog({ movie, isOpen, onOpenChange }: MovieDialogProps) {
  const { addToast } = useToast();
  const updateMovie = useMutation(
    (data: any) => appfetch.put<PostMovie, AxiosResponse<Movie>>(`/Movies/${movie?.id}`, data),
    {
      onMutate: (data) => {
        console.log("onMutate", data);
      },

      onSuccess: (data) => {
        const movie = data.data;

        addToast({
          title: "Cập nhật phim thành công",
          message: `Phim ${movie.title} đã được cập nhật thành công`,
          type: "success",
          id: "update-movie-success",
        });
        queryClient.setQueryData<Movie[]>(["movies"], (oldData) => {
          if (!oldData) return;

          const index = oldData.findIndex((m) => m.id === movie.id);

          if (index !== -1) {
            oldData[index] = movie;
          }

          return oldData;
        });
      },
      onError: (error) => {
        addToast({
          title: "Cập nhật phim thất bại",
          message: `Phim ${movie?.title} không thể được cập nhật, kiểm tra log để biết thêm chi tiết`,
          type: "error",
          id: "update-movie-error",
        });
        console.error("...Error updating movie", movie?.title, " with data: ", error);
      },
    }
  );
  function onSubmit(e: any) {
    e.preventDefault();
    //Checkbox adult

    const movie: PostMovie = {
      title: e.target.title.value,
      name: e.target.name.value,
      director: e.target.director.value,
      cast: e.target.cast.value,
      genreId: e.target.genreId ? e.target.genreId.value : "gen1",
      language: e.target.language.value,
      releaseDate: e.target.releaseDate.value,
      runTime: e.target.runTime.value,
      adult: e.target.adult.checked,
      status: e.target.status.checked,
      budget: e.target.budget.value,
      revenue: e.target.revenue.value,
      vote_average: e.target.vote_average.value,
      vote_count: e.target.vote_count.value,
      video: e.target.video.checked,
      popularity: e.target.popularity.value,
      tagline: e.target.tagline.value,
      homePage: e.target.homePage.value,
      overview: e.target.overview.value,
      posterPath: e.target.posterPath.value,
      backdropPath: e.target.backdropPath.value,
    };
    console.log("...Updating movie", movie.title, " with data: ", movie);
    updateMovie.mutate(movie);
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
          <form onSubmit={onSubmit} className="form-control">
            <label className="label" htmlFor="title">
              <span className="label-text">Title</span>
            </label>
            <input
              id={"title"}
              type="text"
              placeholder="Name"
              className="input input-bordered"
              name={"title"}
              defaultValue={movie?.title}
              required
            />

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
                  defaultValue={movie?.title}
                />
              </div>

              <div>
                <label className="label" htmlFor="director">
                  <span className="label-text">Director</span>
                </label>
                <input
                  id={"director"}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  name="director"
                  required
                  defaultValue={movie?.director}
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label htmlFor="cast" className="label">
                  <span className="label-text">cast</span>
                </label>
                <input
                  id={"cast"}
                  type="text"
                  placeholder="cast"
                  className="input input-bordered"
                  name="cast"
                  defaultValue={movie?.cast}
                />
              </div>

              <div>
                <label className="label" htmlFor="language">
                  <span className="label-text">Language</span>
                </label>
                <input
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"language"}
                  defaultValue={movie?.language}
                  required
                  name="language"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5 items-center">
              <div>
                <label className="label" htmlFor="releaseDate">
                  <span className="label-text">releaseDate</span>
                </label>
                <input
                  defaultValue={movie?.releaseDate}
                  type="date"
                  placeholder="--/--/----"
                  className="input input-bordered"
                  id={"releaseDate"}
                  name="releaseDate"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="runTime">
                  <span className="label-text" placeholder="">
                    runTime
                  </span>
                </label>
                <input
                  defaultValue={movie?.runTime}
                  type="time"
                  placeholder=""
                  className="input input-bordered"
                  id={"runTime"}
                  required
                  name="runTime"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="status">
                  <span className="label-text">status</span>
                </label>
                <input
                  type="checkbox"
                  placeholder=""
                  className="checkbox"
                  id={"status"}
                  name="status"
                  defaultChecked={movie?.status}
                />

                <label className="label" htmlFor="adult">
                  <span className="label-text">adult</span>
                </label>
                <input
                  type="checkbox"
                  placeholder=""
                  className="checkbox"
                  id={"adult"}
                  name="adult"
                  defaultChecked={movie?.adult}
                />
              </div>

              <div>
                <label className="label" htmlFor="budget">
                  <span className="label-text">budget</span>
                </label>
                <input
                  defaultValue={movie?.budget}
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"budget"}
                  required
                  name="budget"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="revenue">
                  <span className="label-text">revenue</span>
                </label>

                <input
                  defaultValue={movie?.revenue}
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"revenue"}
                  required
                  name="revenue"
                />
              </div>

              <div>
                <label className="label" htmlFor="vote_average">
                  <span className="label-text">vote_average</span>
                </label>
                <input
                  defaultValue={movie?.vote_average}
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"vote_average"}
                  required
                  name="vote_average"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="vote_count">
                  <span className="label-text">vote_count</span>
                </label>
                <input
                  defaultValue={movie?.vote_count}
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"vote_count"}
                  required
                  name="vote_count"
                />
              </div>

              <div>
                <label className="label" htmlFor="video">
                  <span className="label-text">video</span>
                </label>
                <input
                  type="checkbox"
                  placeholder=""
                  className="checkbox"
                  id={"video"}
                  name="video"
                  defaultChecked={movie?.video}
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="popularity">
                  <span className="label-text">popularity</span>
                </label>
                <input
                  defaultValue={movie?.popularity}
                  type="number"
                  placeholder=""
                  className="input input-bordered"
                  id={"popularity"}
                  required
                  name="popularity"
                />
              </div>

              <div>
                <label className="label" htmlFor="tagline">
                  <span className="label-text">tagline</span>
                </label>
                <input
                  defaultValue={movie?.tagline}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"tagline"}
                  required
                  name="tagline"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="homePage">
                  <span className="label-text">homePage</span>
                </label>
                <input
                  defaultValue={movie?.homePage}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"homePage"}
                  required
                  name="homePage"
                />
              </div>

              <div>
                <label className="label" htmlFor="overview">
                  <span className="label-text">overview</span>
                </label>
                <input
                  defaultValue={movie?.overview}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"overview"}
                  required
                  name="overview"
                />
              </div>
            </div>

            <div className="flex justify-between gap-5">
              <div>
                <label className="label" htmlFor="posterPath">
                  <span className="label-text">posterPath</span>
                </label>
                <input
                  defaultValue={movie?.posterPath}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"posterPath"}
                  required
                  name="posterPath"
                />
              </div>

              <div>
                <label className="label" htmlFor="backdropPath">
                  <span className="label-text">backdropPath</span>
                </label>
                <input
                  defaultValue={movie?.backdropPath}
                  type="text"
                  placeholder=""
                  className="input input-bordered"
                  id={"backdropPath"}
                  required
                  name="backdropPath"
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
