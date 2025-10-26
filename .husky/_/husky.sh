#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  export husky_skip_init=1
  if [ -f "$HOME/.huskyrc" ]; then
    . "$HOME/.huskyrc"
  fi
fi
