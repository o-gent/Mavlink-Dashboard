FROM efrecon/ts-node:9.1.1

COPY . ./

ENTRYPOINT ["ts-node", "mav.ts"]