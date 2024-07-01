import { BsFilm, BsTicketDetailedFill } from "react-icons/bs";
import { FaUser, FaUsers } from "react-icons/fa";
import { MdMovieFilter } from "react-icons/md";
import { Link } from "react-router-dom";

type Props = {};

function Dashboard({}: Props) {
  return (
    <div className="mx-auto container grid place-items-center min-h-screen">
      <div className="gap-5 text-lg px-5 flex bg-base-100 py-12 rounded-md">
        <Link to={"employee"}>
          <button className="btn btn-primary btn-outline gap-2">
            <FaUsers /> <span>Quản lý nhân viên</span>
          </button>
        </Link>

        <Link to={"movie"}>
          <button className="btn btn-primary btn-outline gap-2">
            <MdMovieFilter /> <span>Quản lý Phim</span>
          </button>
        </Link>

        <Link to={"product"}>
          <button className="btn btn-primary btn-outline gap-2">
            <FaUsers /> <span>Quản lý Sản phẩm</span>
          </button>
        </Link>

        <Link to={"showtime"}>
          <button className="btn btn-primary btn-outline gap-2">
            <BsFilm /> <span>Quản lý lịch chiếu</span>
          </button>
        </Link>

        <Link to={"ticket"}>
          <button className="btn btn-primary btn-outline gap-2">
            <BsTicketDetailedFill /> <span>Xem vé</span>
          </button>
        </Link>

        <Link to={"customer"}>
          <button className="btn btn-primary btn-outline gap-2">
            <FaUser /> <span>Người dùng</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
