import axios from "axios";

const appfetch = axios.create({
  baseURL: "https://localhost:7193/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
});

export default appfetch;
