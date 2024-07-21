import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {};

const Register = (props: Props) => {
  const [loginIsLoading, setLoginIsLoading] = React.useState(false);
  const auth = useAuth();
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  async function onSubmit(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    const fullname = e.target.fullname.value;
    const dob = e.target.dob.value;
    const phoneNumber = e.target.phonenumber.value;
    const password = e.target.password.value;
    try {
      setLoginIsLoading(true);
      await auth?.signup({ email, fullname, dob, phoneNumber, password });
      setLoginIsLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoginIsLoading(false);
    }
  }
  if (auth?.user) return <Navigate to={"/"} />;
  return (
    <div className="cotnainer mx-auto flex justify-center items-center h-screen">
      <form
        className="form-control w-2/5 rounded-md space-y-4 bg-base-200 border-2 px-4 py-12 border-base-300"
        onSubmit={onSubmit}
      >
        <h3 className="text-4xl font-bold text-center">Đăng ký</h3>
        <p className="text-sm text-center text-error">{error}</p>
        <div>
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            id={"email"}
            required
          />

          <label className="label" htmlFor="fullname">
            <span className="label-text">Họ và tên</span>
          </label>
          <input
            type="text"
            placeholder="Nguyen Van A"
            className="input input-bordered w-full"
            id={"fullname"}
            required
          />

          <label className="label" htmlFor="phonenumber">
            <span className="label-text">Số điện thoại</span>
          </label>
          <input
            type="text"
            placeholder="092xxx xxx"
            className="input input-bordered w-full"
            id={"phonenumber"}
            required
          />

          <label className="label" htmlFor="dob">
            <span className="label-text">Ngày sinh</span>
          </label>
          <input
            type="date"
            placeholder="Ngày sinh"
            className="input input-bordered w-full"
            id={"dob"}
            required
          />
          <label className="label" htmlFor="password">
            <span className="label-text">Mật khẩu</span>
          </label>
          <input
            type="password"
            placeholder="*********"
            className="input input-bordered w-full"
            id={"password"}
            required
          />
        </div>
        <button
          className={`btn btn-primary w-full ${
            loginIsLoading ? "loading" : ""
          }`}
        >
          <span className="label-text">Đăng ký</span>
        </button>
        <button
          type="button"
          className={`btn btn-primary w-full`}
          onClick={() => navigate("/dang-nhap")}
        >
          <span className="label-text"> Đăng Nhập</span>
        </button>
      </form>
    </div>
  );
};
export default Register;
