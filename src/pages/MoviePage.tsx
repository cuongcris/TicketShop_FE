import { BsPlay, BsStars } from "react-icons/bs";
import { Link, useLoaderData } from "react-router-dom";
import { Movie as MovieEntity } from "../entity/Movie";

function MoviePage() {
  const movie = useLoaderData() as MovieEntity;
  console.log(movie);

  return (
    <div className="gap-3 max-h-screen overflow-hidden">
      <div className="">
        {/* Full screen image */}
        <img
          src={`${movie.posterPath}`}
          alt={movie.title}
          className="object-cover absolute top-0 left-0 h-screen w-screen max-w-none -z-10 blur-sm brightness-50"
        />

        {/* Movie info */}
        <div className="w-full h-screen flex justify-center items-center relative ">
          <article className={"relative px-8 py-12 min-w-[50%] text-center font-medium drop-shadow-md leading-6"}>
            <span
              className={"absolute left-0 top-0 flex gap-2 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"}
            >
              {movie.vote_average.toFixed(1)} <BsStars className="text-yellow-500" />
            </span>
            <span className={"absolute right-0 top-0 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"}>
              {movie.release_date}
            </span>
            <span className={"absolute right-0 bottom-0 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"}>
              {movie.genres?.map((genre) => genre.name).join(", ")}
            </span>
            <span className={"absolute left-0 bottom-0 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"}>
              {movie.status}
            </span>
            <h3 className={"lg:text-8xl xl:text-9xl text-2xl sm:text-3xl md:text-4xl font-bold mx-auto mb-5"}>
              {movie.title}
            </h3>
            <p className="lg:text-md text-">
              {movie.overview.length >= 400 ? movie.overview.slice(0, 400) + "..." : movie.overview}
            </p>
            <div className="flex gap-2 mx-auto w-fit my-5">
              <Link to={`/phim-dang-chieu?movieId=${movie.id}`}>
                <button className="btn btn-accent">Đặt vé ngay</button>
              </Link>
              {movie.videos?.length > 0 && (
                <Link to={`https://www.youtube.com/watch?v=${movie.videos[0].site}`} target="_blank">
                  <button className="btn gap-3 btn-ghost">
                    <BsPlay className="text-lg" />
                    Xem trailer
                  </button>
                </Link>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default MoviePage;
