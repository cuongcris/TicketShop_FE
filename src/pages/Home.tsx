import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { MdNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import { Movie } from "../entity/Movie";
import appfetch from "../lib/axios";

function Home() {
  return (
    <>
      <section className="w-fit max-w-7xl mx-auto">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={3000}
          emulateTouch
          dynamicHeight
        >
          <div>
            <img src={"../picture/slider1.jpg"} />
          </div>
          <div>
            <img src={"../picture/slider2.jpg"} />
          </div>

          <div>
            <img src={"../picture/slider3.png"} />
          </div>
        </Carousel>
      </section>
      <section className="w-full h-fit">
        <Movies />
      </section>
    </>
  );
}

const MovieTabs = [
  {
    id: "phim-dang-chieu",
    label: "Phim đang chiếu",
    href: "/phim-dang-chieu",
  },
  {
    id: "phim-sap-chieu",
    label: "Phim sắp chiếu",
    href: "/phim-sap-chieu",
  },
];

function Movies() {
  const [tab, setTab] = useState(MovieTabs[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const { isLoading, isError, error, data } = useQuery<Movie[]>(
    ["movies", tab], // this is key, determine when to refetch
    async () => {
      const res = await appfetch(`/Movies`);
      const data = await res.data;
      const currentDate = new Date();

      // Filter movies based on tab
      if (tab === "phim-dang-chieu") {
        return data.filter(
          (movie: { releaseDate: string | number | Date }) =>
            new Date(movie.releaseDate) <= currentDate
        );
      } else if (tab === "phim-sap-chieu") {
        return data.filter(
          (movie: { releaseDate: string | number | Date }) =>
            new Date(movie.releaseDate) > currentDate
        );
      }

      return data;
    }
  );

  function handleNext() {
    if (data) {
      setCurrentSlide((prevSlide) => (prevSlide + 4) % data.length);
    }
  }

  function handlePrev() {
    if (data) {
      setCurrentSlide(
        (prevSlide) => (prevSlide - 4 + data.length) % data.length
      );
    }
  }

  // Filter movies based on search term
  const filteredMovies = data?.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVisibleMovies = () => {
    if (!filteredMovies) return [];
    const totalMovies = filteredMovies.length;
    const visibleMovies = [];

    for (let i = 0; i < 4; i++) {
      visibleMovies.push(filteredMovies[(currentSlide + i) % totalMovies]);
    }

    return visibleMovies;
  };

  const moviesToShow = getVisibleMovies();

  return (
    <div className="px-4 relative overflow-hidden">
      <div className="tabs tabs-boxed bg-base-200 w-fit mx-auto my-4">
        {MovieTabs.map((item) => (
          <div
            className={`tab ${tab === item.id ? "tab-active" : ""}`}
            key={item.href}
          >
            <input type="radio" name="tab" id={item.href} hidden />
            <label
              onClick={() => {
                setTab(item.id);
                setCurrentSlide(0); // Reset slide position when tab changes
              }}
              htmlFor={item.href}
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm phim..."
        className="input input-bordered w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isLoading && (
        <div className="gap-3 overflow-hidden flex">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-[420px] w-[280px] bg-gray-600 animate-pulse rounded-md shadow-xl"
              ></div>
            ))}
        </div>
      )}
      {isError && <div>{error as string}</div>}
      <section className="gap-3 overflow-hidden flex" ref={sliderRef}>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 translate-y-1/2 z-10 text-3xl bg-gray-600 rounded-full"
        >
          <MdNavigateNext />
        </button>
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 translate-y-1/2 z-10 text-3xl bg-gray-600 rounded-full"
        >
          <MdOutlineNavigateBefore />
        </button>
        {moviesToShow &&
          moviesToShow.map((item: Movie) => (
            <Link
              to={`/movie/${item.id}`}
              className="card bg-base-100 group shadow-xl w-full overflow-clip min-w-[10rem] min-h-full"
              key={item.id}
            >
              <figure className="w-full overflow-clip">
                <img
                  src={item.posterPath}
                  className={
                    "w-full group-hover:scale-110 transition-transform duration-300"
                  }
                  key={item.id}
                  height={500}
                  alt={item.title}
                  loading="lazy"
                  width={300}
                />
              </figure>
              <div className="card-body px-2 py-3 text-center justify-center">
                <h2 className="card-title text-lg mx-auto">{item.title}</h2>
              </div>
            </Link>
          ))}
      </section>
    </div>
  );
}

export default Home;
