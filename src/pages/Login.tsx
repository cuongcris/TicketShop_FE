import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {};

function Login({}: Props) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loginIsLoading, setLoginIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      setLoginIsLoading(true);
      await auth?.signin({ email, password });
    } catch (error) {
      console.log(error);
      setError("Email hoặc mật khẩu không đúng");
      setLoginIsLoading(false);
    }
  }

  if (auth?.user) return <Navigate to={"/"} />;
  return (
    <div className="container mx-auto flex justify-center items-center h-screen">
      <form
        className="form-control w-2/5 rounded-md space-y-4 bg-base-200 border-2 px-4 py-12 border-base-300"
        onSubmit={onSubmit}
      >
        <a type="submit" className="btn w-20" onClick={() => navigate("/")}>
          Back Home
        </a>
        <h3 className="text-4xl font-bold text-center">Đăng nhập</h3>

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
          <span className="label-text">Đăng nhập</span>
        </button>
        <button
          type="button"
          className={`btn btn-primary w-full`}
          onClick={() => navigate("/dang-ky")}
        >
          <span className="label-text">Đăng Ký</span>
        </button>
      </form>
    </div>
  );
}

export default Login;
