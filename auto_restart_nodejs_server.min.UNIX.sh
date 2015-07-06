#!/bin/sh
while read userInput
do
  echo To stop this script, press Ctrl-C.
  echo To make this script do nothing, enter any non-empty value and press enter.
  ## test -n gives True if the length of string is non-zero --> 1st True leads to checking "break/continue" and executing it
  test -n "$userInput" && continue

  #kill all node instances before starting a new one
  ## killall node
  ##### ##### ##### pkill node

  #use backtick (`) symbol so that node terminates itself when this script is terminated
  `node sharedThingsServer.js` #so as to prevent node from running invisibly, which causes "Error: listen EADDRINUSE"

  # Get PID of the previous command launched in this bash script
  ## PID = $!
  ## echo $PID
done
