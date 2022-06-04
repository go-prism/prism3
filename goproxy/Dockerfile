ARG GITLAB_PREFIX
FROM ${GITLAB_PREFIX}registry.gitlab.com/av1o/base-images/go-git:1.18 as BUILDER

RUN mkdir -p /home/somebody/go && \
    mkdir -p /home/somebody/.tmp
WORKDIR /home/somebody/go

ARG GOPRIVATE
ARG GOPROXY

ARG AUTO_DEVOPS_GO_GIT_CFG
ARG AUTO_DEVOPS_GO_COMPILE_FLAGS

# copy our code in
COPY --chown=somebody:0 . .

# build the binary
RUN TMPDIR=/home/somebody/.tmp CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -buildmode=pie -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main ./cmd/...

# runner
FROM ${GITLAB_PREFIX}registry.gitlab.com/av1o/base-images/go-git:1.18

WORKDIR /app
COPY --from=BUILDER --chown=somebody:0 /home/somebody/go/main /app/main

EXPOSE 8080
ENTRYPOINT ["/app/main"]
