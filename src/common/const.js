import UrlRouter from "../component/common/UrlRouter/UrlRouter";
import OrderPortal from "../component/Restaurant/OrderPortal/OrderPortal";
import Ticket from "../component/Ticket/Ticket";

export const routesMapping = {
  "/:token?": UrlRouter,
  "/restaurant/orderportal": OrderPortal,
  "/hotelroom/food/orderPortal": OrderPortal,
  "/ticket/:eventId?": Ticket,
};
