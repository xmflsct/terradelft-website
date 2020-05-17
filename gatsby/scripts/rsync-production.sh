#!/bin/bash

n=0
until [ "$n" -ge 10 ]
do
    sshpass -p "${remote_pass}" rsync -azr --partial --checksum --delete --exclude "preview" --exclude "archive1" --exclude "archive2" --exclude "robots.txt" -e "ssh -o StrictHostKeyChecking=no" ${local_dir} ${remote_user}@${remote_host}:${remote_dir}
    if [ "$?" = "0" ] ; then
        echo "rsync completed normally"
        exit
    else
        echo "Rsync failure. Backing off and retrying..."
        n=$((n+1))
        if [ "$n" -eq 10 ] ; then
            exit 1
        fi
        sleep 10
    fi
done