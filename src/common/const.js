import UrlRouter from "../component/common/UrlRouter/UrlRouter";
import OrderPortal from "../component/Restaurant/OrderPortal/OrderPortal";

export const routesMapping = {
  "/:token?": UrlRouter,
  "/restaurant/orderportal": OrderPortal,
};
