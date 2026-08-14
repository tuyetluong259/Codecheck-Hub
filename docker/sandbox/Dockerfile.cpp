# C++ Sandbox Image — minimal, no network
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /sandbox

# Tạo user không có quyền root
RUN useradd -m -s /bin/bash sandboxuser
USER sandboxuser

# Entrypoint sẽ được override khi run container
CMD ["bash"]
