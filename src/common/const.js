import AccountProfile from "../component/AccountProfile/AccountProfile";
import UrlRouter from "../component/common/UrlRouter/UrlRouter";
import OrderPortal from "../component/Restaurant/OrderPortal/OrderPortal";
import Ticket from "../component/Ticket/Ticket";
import Tracing from "../component/Tracing/Tracing";

export const routesMapping = {
  "/:token?": UrlRouter,
  "/restaurant/orderportal": OrderPortal,
  "/hotelroom/food/orderPortal": OrderPortal,
  "/grocery/orderPortal": OrderPortal,
  "/ticket/:eventId?": Ticket,
  "/profile/:id?": AccountProfile,
  "/tracing/:trackerType?": Tracing,
};
