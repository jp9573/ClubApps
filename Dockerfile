FROM node:12.15.0-alpine as build

WORKDIR /app
COPY . /app/

#building react
RUN npm install --silent
RUN npm run build

#nginx
FROM nginx:1.18
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
