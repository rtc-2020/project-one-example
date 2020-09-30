#!/usr/bin/env zsh

# Set a crontab to run this script every five minutes
# */5 * * * * /path/to/fetch-abc.sh

# See http://zsh.sourceforge.net/Doc/Release/Expansion.html#Modifiers
cd "$0:a:h:h/var"
touch abc.html
cp abc.html abc.old.html
curl -o abc.html https://abcnews.go.com/
exit
