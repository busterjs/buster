#!/bin/sh

returnCode=0

for dir in `ls -d */ | cut -f1 -d'/'`
do
  echo $dir
  cd $dir
  if [ -f args.txt ];
  then
    args=`cat args.txt`
    eval buster-test $args $*
  else
    buster-test $*
  fi
  if [ $? -ne 0 ]; then returnCode=1; fi
  cd ..
done

echo exit code $returnCode
exit $returnCode
