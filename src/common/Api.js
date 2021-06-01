const axios = require("axios");

const domain = process.env.REACT_APP_BACKEND_API_URL;
const resolverDomain = process.env.REACT_APP_LINKMANAGER_API_URL;

const axiosInstance = axios.create({
  baseURL: `${domain}api`,
});

export function urlResolver(token) {
  return axios
    .create({
      baseURL: `${resolverDomain}api`,
    })
    .post(
      "/Resolve",
      {
        Code: token,
      },
      {
        headers: {
          "x-functions-key": process.env.REACT_APP_LINK_RESOLVER_API_KEY,
        },
      }
    );
}

export function fetchMenuApi(token) {
  return axiosInstance.get("/FoodMenuProvider", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function submitOrderApi(token, data) {
  return axiosInstance.post("/FoodOrderSubmissionProvider", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTicketInfoApi(token, eventId) {
  return axiosInstance.get(`/TicketProvider?eventId=${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTracingInfoApi(token, trackerType) {
  return axiosInstance.get(`/TrackingProvider?trackertype=${trackerType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getUserProfileApi(token) {
  return axiosInstance.get(`/Profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
