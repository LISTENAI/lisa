#!/usr/bin/env bash

lisa_has() {
  type "$1" > /dev/null 2>&1
}

lisa_default_install_dir() {
  printf %s "${HOME}/.listenai/lisa"
}

lisa_echo() {
  command printf %s\\n "$*" 2>/dev/null
}

lisa_download() {
  if lisa_has "curl"; then
    command curl --fail --compressed -q "$@"
  elif lisa_has "wget"; then
    ARGS=$(lisa_echo "$@" | command sed -e 's/--progress-bar /--progress=bar /' \
                            -e 's/--compressed //' \
                            -e 's/--fail //' \
                            -e 's/-L //' \
                            -e 's/-I /--server-response /' \
                            -e 's/-s /-q /' \
                            -e 's/-sS /-nv /' \
                            -e 's/-o /-O /' \
                            -e 's/-C - /-c /')
    eval wget $ARGS
  fi
}

lisa_tar() {
  if lisa_has "tar"; then
    command tar xf "$@"
  else
    lisa_echo >&2 'You need tar to install Lisa'
    exit 1
  fi
}

lisa_shell_command_link() {
  lnpath="/usr/local/bin/lisa"
  if [ -L "$lnpath" ]; then
    rm $lnpath;
  fi
  lisa_echo "=> ${LISA_BIN}/lisa -> $lnpath"
  sudo ln -s "${LISA_BIN}/lisa" $lnpath
}

lisa_get_os() {
  local LISA_UNAME
  LISA_UNAME="$(command uname -a)"
  local LISA_OS
  case "${LISA_UNAME}" in
    Linux\ *) LISA_OS=linux ;;
    Darwin\ *) LISA_OS=darwin ;;
  esac
  lisa_echo "${LISA_OS-}"
}

lisa_get_format() {
  local LISA_UNAME
  LISA_UNAME="$(command uname -a)"
  local LISA_FORMAT
  case "${LISA_UNAME}" in
    Linux\ *) LISA_FORMAT=.tar.xz ;;
    Darwin\ *) LISA_FORMAT=.tar.gz ;;
  esac
  lisa_echo "${LISA_FORMAT-}"
}

lisa_do_install() {
  local INSTALL_DIR
  INSTALL_DIR="$(lisa_default_install_dir)"

  local LISA_OS
  LISA_OS="$(lisa_get_os)"

  local LISA_FORMAT
  LISA_FORMAT="$(lisa_get_format)"

  local LISA_SOURCE
  LISA_SOURCE="https://cdn.iflyos.cn/public/cskTools/lisa-zephyr-${LISA_OS}_x64${LISA_FORMAT}"

  local LISA_BIN
  LISA_BIN="${INSTALL_DIR}/libexec"

  local LISA_RC
  LISA_RC="${HOME}/ifly/lisa/standalone/bash/.lisarc"

  if ! [ -d "${INSTALL_DIR}" ]; then
    command mkdir -p $INSTALL_DIR
  fi

  lisa_echo "=> Downloading Lisa to '$INSTALL_DIR'"
  lisa_download -s "$LISA_SOURCE" -o "$INSTALL_DIR/lisa-zephyr-${LISA_OS}_x64${LISA_FORMAT}"
  lisa_echo "=> tar to '$INSTALL_DIR'"
  lisa_tar "$INSTALL_DIR/lisa-zephyr-${LISA_OS}_x64${LISA_FORMAT}" -C "$INSTALL_DIR"
  lisa_shell_command_link
  lisa_echo "=> Success! try run command 'lisa info zephyr'"
}

lisa_do_install
