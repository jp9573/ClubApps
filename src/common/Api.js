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

export function fetchMenuApi(token, sessionCode) {
  return axiosInstance.get(`/FoodMenu?sessionCode=${sessionCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getCouponCodeApi(token, couponCode) {
  return axiosInstance.get(`/Coupon?code=${couponCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getRatingsApi(token, id) {
  return axiosInstance.get(`/Establishment?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function submitOrderApi(token, data) {
  return axiosInstance.post("/FoodOrderSubmission", data, {
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

export function getUserProfileApi(token) {
  return axiosInstance.get(`/Profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function saveUserProfileApi(token, data) {
  return axiosInstance.post(`/ProfileUpdate`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTracingInfoApi(token, trackerType) {
  return axiosInstance.get(`/Tracking?trackerType=${trackerType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTracingUpdateApi(token, trackerId) {
  return axiosInstance.get(`/TrackingUpdate?trackerId=${trackerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTracingPlaceApi(token, placeId) {
  return axiosInstance.get(`/TrackingPlace?id=${placeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getTracingBusinessDetailApi(token, id) {
  return axiosInstance.get(`/TrackingProvider?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getVendorDetailApi(token, id) {
  return axiosInstance.get(`/TrackingPerson?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateDestinationApi(token, data) {
  return axiosInstance.post(`/UpdateDestination`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
