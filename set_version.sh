#/bin/bash
npm config set git-tag-version=false
version=`git describe --tags --abbrev=0`
echo "seting npm version to ${version:1}"
npm version ${version:1} --allow-same-version
