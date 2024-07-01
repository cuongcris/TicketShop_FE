import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

function useRequireAuth({ requiredAdmin }: { requiredAdmin?: boolean }) {
  const auth = useAuth();
  const router = useNavigate();

  useEffect(() => {
    console.log(auth);

    const isAdmin = auth?.user?.email === "admin@gmail.com";

    if (!auth?.user) {
      router("/dang-nhap");
    } else if (requiredAdmin && !isAdmin) {
      //Countinue
    }
  }, [auth?.user, requiredAdmin]);

  return auth;
}
export default useRequireAuth;
