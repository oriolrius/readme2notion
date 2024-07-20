#!/bin/bash

# Get the path of the current repository
REPOS_PATH=$(git rev-parse --show-toplevel)

# Create symbolic links for all hooks in the githooks directory
for hook in ${REPOS_PATH}/githooks/*; do
  hook_name=$(basename $hook)
  ln -sf ../../githooks/$hook_name ${REPOS_PATH}/.git/hooks/$hook_name
done

echo "Hooks have been set up."
