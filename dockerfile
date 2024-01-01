FROM efrecon/ts-node:10.9.2

COPY . ./

ENTRYPOINT ["ts-node", "mav.ts"]