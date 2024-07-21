import * as Separator from "@radix-ui/react-separator";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { MdNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";
import {
  Navigate,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import DatePicker from "../components/DatePicker";
import SeatMap from "../components/SeatMap";
import ShowTimePicker from "../components/ShowTimePicker";
import { Movie } from "../entity/Movie";
import { Seat } from "../entity/Seat";
import { ShowTime } from "../entity/ShowTime";
import { useAuth } from "../hooks/useAuth";
import { CheckoutFormProps } from "./Checkout";

function OnGoingPage() {
  const data = useLoaderData() as Movie[];
  const auth = useAuth();
  let [searchParams, setSearchParams] = useSearchParams();
  const movieId = searchParams.get("movieId");

  const [movie, setMovie] = useState<Movie | null>(
    data.find((item) => item.id === movieId) as Movie
  ); //Find movie which get from database by id

  const sliderRef = useRef<HTMLDivElement>(null);

  function handleNext() {
    //Scroll to next
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        // to right 1 screen
        left: 180 * 6 + 10,
        behavior: "smooth",
      });
    }
  }

  function handlePrev() {
    //Scroll to prev
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -180 * 6 - 10,
        behavior: "smooth",
      });
    }
  }

  function selectMovie(movieId: string) {
    setSearchParams({ movieId });
    setMovie(data.find((item) => item.id === movieId) as Movie);
  }
  if (!auth?.user) return <Navigate to="/dang-nhap" />;
  return (
    <div className="px-4 relative flex flex-col w-full">
      <section className="overflow-hidden flex gap-3 relative" ref={sliderRef}>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2  translate-y-1/2 z-10 text-3xl bg-gray-600 rounded-full "
        >
          <MdNavigateNext />
        </button>
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 translate-y-1/2 z-10 text-3xl bg-gray-600 rounded-full "
        >
          <MdOutlineNavigateBefore />
        </button>
        {data &&
          data.map((item: Movie, index: number) => (
            <div
              onClick={() => {
                selectMovie(item.id.toString());
              }}
              className={`card bg-base-100 group shadow-xl w-full overflow-clip min-w-[10rem] min-h-full transition-all duration-100 cursor-pointer
              ${
                movie?.id === item.id
                  ? "border-2 border-blue-500"
                  : "border-2 border-transparent"
              }
            `}
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
            </div>
          ))}
      </section>
      <Separator.Root className="bg-base-content data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-6 rounded-full" />
      {movie && <SelectedSeats movie={movie} />}
    </div>
  );
}

//Default seats, will be used to reset seats. 10x10 (A1...J10)
const defaultSeats: Seat[] = Array.from({ length: 10 }, (_, i) =>
  Array.from({ length: 10 }, (_, j) => ({
    rowName: String.fromCharCode(65 + i),
    seatNumber: j + 1,
  }))
).flat();

function SelectedSeats({ movie }: { movie: Movie }) {
  const [chosenSeats, setChosenSeats] = useState<Seat[]>([]);
  const [time, setTime] = useState("");
  const [chosenShowTime, setChosenShowTime] = useState<ShowTime | null>(null);
  const [date, setDate] = useState(new Date());

  const { data: showTimes, isLoading: showTimeLoading } = useQuery<ShowTime[]>(
    ["showtimes", movie.id],
    async () => {
      const res = await fetch(
        `https://localhost:7193/api/ShowTimes/movie/${movie.id}?movieId=${movie.id}`
      );
      const data = await res.json();
      return data;
    }
  );

  const { isLoading: isLoadingSeat, data: reservedSeats } = useQuery<Seat[]>(
    ["seats", movie.id, time],
    async () => {
      const selectedShowTime = showTimes?.find((item) => {
        const timeDate = new Date(item.startTime as string);
        //Get hour and minute
        const timeString = `${timeDate.getHours()}:${timeDate.getMinutes()}`;
        return timeString === time;
      });

      const res = await fetch(
        `https://localhost:7193/api/Seats/Showtime/${selectedShowTime?.id}`
      );
      const data = await res.json();
      return data;
    },
    {
      staleTime: Infinity,
      //If time is not selected, don't fetch seats
      enabled: !!time,
    }
  );

  const seatToggle = (seat: Seat) => {
    if (chosenSeats.find((item) => item.id === seat.id)) {
      setChosenSeats(chosenSeats.filter((item) => item.id !== seat.id));
    } else {
      setChosenSeats([...chosenSeats, seat]);
      //... la toan tu spraed --> them seat va chosenSeats
      //Example arr1 = [1, 2, 3];  arr2 = [...arr1, 4, 5]; // arr2 sẽ là [1, 2, 3, 4, 5]
    }
  };

  const navigate = useNavigate();

  function handleDateChange(date: Date) {
    setDate(date);
  }

  function selectAll() {
    if (!reservedSeats) return;
    const availableSeats = defaultSeats.filter(
      (item) =>
        !reservedSeats.some(
          (item1) =>
            item1.seatNumber === item.seatNumber &&
            item1.rowName == item.rowName
        )
    );
    setChosenSeats(availableSeats);
  }

  const times = useMemo(() => {
    if (!showTimes) return [];

    //Take only showTimes that in the date selected
    const filteredShowTimes = showTimes.filter((item) => {
      const showTimeDate = new Date(item.startTime as string);
      return (
        showTimeDate.getDate() === date.getDate() &&
        showTimeDate.getMonth() === date.getMonth()
      );
    });

    //Get all times from showTimes
    const times = filteredShowTimes.map(
      (item) =>
        `${new Date(item.startTime as string).getHours()}:${new Date(
          item.startTime as string
        ).getMinutes()}`
    );
    return times;
  }, [showTimes, date]);

  const isLoading = useMemo(() => {
    return isLoadingSeat || showTimeLoading;
  }, [isLoadingSeat, showTimeLoading]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Form submitted");
    const data: CheckoutFormProps = {
      movie,
      seats: chosenSeats,
      showTime: chosenShowTime as ShowTime,
      date,
    };
    navigate(`/checkout`, {
      state: data,
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-12 min-h-screen">
        {/* Selected Movie */}

        <article className="col-span-4 flex justify-center items-center flex-col px-24">
          <div className=" bg-base-100 shadow-xl w-full overflow-clip min-w-[5rem] min-h-fit max-w-[10rem] mx-auto">
            <figure className="w-full overflow-clip">
              <img
                src={movie.posterPath}
                className={
                  "w-full group-hover:scale-110 transition-transform duration-300"
                }
                key={movie.id}
                height={500}
                alt={movie.title}
                loading="lazy"
                width={300}
              />
            </figure>
          </div>

          <section className="w-full my-4 bg-base-100/50 px-4 py-3 rounded-md  space-y-3 border border-base-content/50">
            <div className="font-medium mx-auto w-fit">
              <h3 className="pb-3">Chỗ ngồi: ({chosenSeats.length})</h3>
              {isLoading && (
                <p className="flex flex-wrap gap-1 justify-center">
                  {chosenSeats.map((item) => (
                    <span
                      className="bg-base-content w-10 text-center px-2 py-1 rounded-md text-base-300"
                      key={`${item.rowName}${item.seatNumber}`}
                    >
                      {item.rowName}
                      {item.seatNumber}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </section>
          <button
            className={`btn btn-primary w-full rounded-full gap-2 ${
              chosenSeats.length === 0 ? "btn-disabled" : ""
            }`}
            type="submit"
          >
            <span className="btn-text">Đặt Ngay</span>
            <FiArrowRight className="inline-block mr-2 text-lg" />
          </button>
        </article>

        {/* Order ticket */}
        <article className="text-center col-span-8 space-y-5 w-full">
          <h1 className="text-4xl font-bold">Đặt vé</h1>
          <div className="space-y-5">
            <DatePicker currentDate={date} onChange={handleDateChange} />
            <ShowTimePicker
              time={time}
              onChange={(time) => {
                setTime(time);
                const set = showTimes?.find((item) => {
                  const timeDate = new Date(item.startTime as string);
                  //Get hour and minute
                  const timeString = `${timeDate.getHours()}:${timeDate.getMinutes()}`;
                  return timeString === time;
                });

                setChosenShowTime(set as ShowTime);
              }}
              availableTime={times}
            />
            {isLoading ? (
              <div>Loading...</div> // Hiển thị trạng thái loading
            ) : (
              reservedSeats && (
                <SeatMap
                  defaultSeats={defaultSeats}
                  chosenSeats={chosenSeats}
                  seatToggle={seatToggle}
                  reservedSeats={reservedSeats}
                />
              )
            )}
            {!isLoading && (
              <button
                className="btn btn-outline btn-ghost mt-12 btn-sm"
                onClick={selectAll}
              >
                Mr. Riêng Tư
              </button>
            )}
          </div>
        </article>
      </div>
    </form>
  );
}

export default OnGoingPage;
