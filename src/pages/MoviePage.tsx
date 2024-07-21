import { BsPlay, BsStars } from "react-icons/bs";
import { Link, useLoaderData } from "react-router-dom";
import { Movie as MovieEntity } from "../entity/Movie";
import { BsCalendar } from "react-icons/bs";
function MoviePage() {
  const movie = useLoaderData() as MovieEntity;
  console.log("movie:" + movie.status);

  return (
    <div className="gap-3 max-h-screen overflow-hidden">
      <div className="">
        {/* Full screen image */}
        <img
          src={`${movie.backdropPath}`}
          alt={movie.title}
          className="object-cover absolute top-0 left-0 h-screen w-screen max-w-none -z-10 blur-sm brightness-50"
        />

        {/* Movie info */}
        <div className="w-full h-screen flex justify-center items-center relative ">
          <article
            className={
              "relative px-8 py-12 min-w-[50%] text-center font-medium drop-shadow-md leading-6"
            }
          >
            <span className="absolute left-0 top-0 flex items-center gap-2 text-sm px-3 py-1 font-light rounded-lg shadow-md">
              <BsStars
                className="text-yellow-500"
                style={{ fontSize: "1.5rem" }}
              />
              <span className="text-lg font-bold">
                Average :{movie.vote_average.toFixed(1)}
              </span>
            </span>
            <span
              className="absolute right-0 top-0 flex items-center text-xs px-2 py-1  font-bold rounded-lg shadow-md "
              style={{ fontSize: "1.5rem" }}
            >
              <BsCalendar className="mr-1 text-lg text-gray-500" />
              Release Date: {movie.releaseDate}
            </span>
            <span
              className={
                "absolute right-0 bottom-0 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"
              }
            >
              {movie.genres?.map((genre) => genre.name).join(", ")}
            </span>
            <span
              className={
                "absolute left-0 bottom-0 text-xs px-2 font-light lg:text-md md:px-0 md:font-normal"
              }
            >
              {movie.status}
            </span>
            <h5
              className={
                "lg:text-6xl xl:text-7xl text-1xl sm:text-1xl md:text-2xl font-bold mx-auto mb-5"
              }
            >
              {movie.title}
            </h5>
            <p className="lg:text-md text-">
              {movie.overview.length >= 400
                ? movie.overview.slice(0, 400) + "..."
                : movie.overview}
            </p>
            <div className="text-center">
              <div className="max-w-[25%] mr-8">
                <div className="card bg-base-100 shadow-xl w-full overflow-clip min-w-[10rem] min-h-full">
                  <figure className="w-full overflow-clip">
                    <img
                      src={movie.posterPath}
                      className="w-full"
                      alt={movie.title}
                      loading="lazy"
                      width={300}
                    />
                  </figure>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mx-auto w-fit my-5">
              <Link to={`/phim-dang-chieu?movieId=${movie.id}`}>
                <button className="btn btn-accent">Đặt vé ngay</button>
              </Link>
              {movie.video === true && (
                <Link
                  to={`https://www.youtube.com/watch?v=ceqa2pIN9ng`}
                  target="_blank"
                >
                  <button className="btn gap-3 btn-primary">
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
