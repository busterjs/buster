#!/bin/sh

returnCode=0

for dir in `ls -d */ | cut -f1 -d'/'`
do
  echo $dir
  cd $dir
  buster-test $*
  if [ $? -ne 0 ]; then returnCode=1; fi
  cd ..
done

echo exit code $returnCode
exit $returnCode