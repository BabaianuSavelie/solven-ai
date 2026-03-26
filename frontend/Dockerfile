FROM node:24-alpine3.22 AS build

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine AS final

COPY --from=build /usr/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]