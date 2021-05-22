const axios = require("axios");

const domain = process.env.REACT_APP_APPLINK_DOMAIN;

const axiosInstance = axios.create({
  baseURL: `https://${domain}/api`,
});

export function fetchMenuApi(token) {
  return axiosInstance.get("/FoodMenuProvider", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
