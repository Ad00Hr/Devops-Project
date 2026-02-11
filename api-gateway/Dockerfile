# api-gateway/Dockerfile
FROM golang:1.20

WORKDIR /app

COPY . .

RUN go mod init api-gateway
RUN go get -d ./...
RUN go build -o gateway .

CMD ["./gateway"]