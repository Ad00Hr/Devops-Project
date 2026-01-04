# -------- BUILD STAGE --------
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache build-base

ENV CGO_ENABLED=1
ENV GOOS=linux

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o app main.go

# -------- RUNTIME STAGE --------
FROM alpine:3.20

RUN apk add --no-cache ca-certificates sqlite

WORKDIR /app

COPY --from=builder /app/app .

EXPOSE 8080

CMD ["./app"]
