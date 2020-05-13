#!/bin/bash

n=0
until [ "$n" -ge 10 ]
do
    sshpass -p "${remote_pass}" rsync -azr --dry-run --partial --checksum --progress --delete --exclude "not-delete" --exclude "archive" -e "ssh -o StrictHostKeyChecking=no" ${local_dir} ${remote_user}@${remote_host}:${remote_dir}
    if [ "$?" = "0" ] ; then
        echo "rsync completed normally"
        exit
    else
        echo "Rsync failure. Backing off and retrying..."
        n=$((n+1)) 
        sleep 10
    fi
done