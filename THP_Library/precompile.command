#!/bin/bash

echo "Deleting THP_Config.js"
cd "`dirname "$0"`"
rm THP_Library.js

echo "Creating file list of all sub js libraries"
find "`dirname "$0"`" -name '*.js' > filelist.txt
cat filelist.txt

echo "Concat all of files into new THP_Config.js"
while read line
do
  cat $line >> THP_Library.js
done < filelist.txt
rm filelist.txt
