#/bin/bash

# Generate the blob to be injected.
node --experimental-sea-config sea-config.json

# Copy the node executable. Supports asdf and nvm.
NODE=$(asdf which node || nvm which node || command -v node)
cp "$NODE" substreams-sink-victoria-metrics-linux

# Inject the blob into the copied binary.
npx postject substreams-sink-victoria-metrics-linux NODE_SEA_BLOB dist/sea.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2