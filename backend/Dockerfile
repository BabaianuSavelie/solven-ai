FROM node:24-alpine3.22 as build

WORKDIR /usr/solven

COPY package.json .
COPY package-lock.json .

RUN npm ci --omit=dev

COPY . .

RUN npm run build

FROM node:24-alpine3.22 as final

WORKDIR /usr/solven

COPY --from=build /usr/solven/dist ./dist
COPY --from=build /usr/solven/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]

