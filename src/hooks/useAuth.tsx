import React, { createContext, useContext, useEffect, useState } from "react";
import appfetch from "../lib/axios";

const authContext = createContext<ReturnType<typeof useProvideAuth> | null>(null);

export function ProvideAuth({ children }: React.PropsWithChildren<{}>) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};
// Provider hook that creates auth object and handles state
type LoginProps = {
  email: string;
  password: string;
};

type RegisterProps = {
  email: string;
  password: string;
  dob: string;
  fullname: string;
  phoneNumber: string;
};

type User = {
  email: string;
  password: string;
  dob: string;
  fullname: string;
  phoneNumber: string;
  token: string;
};

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  function saveUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  function getUser() {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  function clearUser() {
    localStorage.removeItem("user");
  }

  const signin = async ({ email, password }: LoginProps) => {
    const res = await appfetch.post(
      "/Authen/login",
      {
        email,
        password,
      },
      {}
    );
    if (res.status !== 200) throw new Error("Tài khoản hoặc mật khẩu không đúng");

    const data = await res.data;

    const { token, user } = data;

    user.token = token;

    if (data.error) {
      throw new Error(data.error);
    }
    saveUser(user); //Local storage -- longer to live
    setUser(user); //Save in state -- shorter to live + faster
    return data;
  };
  const signup = async ({ dob, email, fullname, password, phoneNumber }: RegisterProps) => {
    try {
      const res = await appfetch("/Authen/register", {
        method: "POST",
        data: {
          dob,
          email,
          fullname,
          password,
          phoneNumber,
        },
      });
      const data = res.data;
      if (data.error) {
        throw new Error(data.error);
      }
      //after register, login
      await signin({ email, password });
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  const signout = () => {
    clearUser();
    setUser(null);
  };

  useEffect(() => {
    //Load user from local storage
    const user = getUser();

    if (user) {
      setUser(user);
    }

    //Cleanup
    return () => {};
  }, []);
  // Return the user object and auth methods
  return {
    user,
    signin,
    signup,
    signout,
  };
}
