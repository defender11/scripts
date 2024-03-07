#!/bin/bash

ol_datetime="[ $(date "+%Y-%m-%d %H:%M:%S") ] "
ol_tg_user_id=1194247671
ol_tg_bot_token=bot6576742900:AAFLJ2MLrIFxwsimOf3v7QqFUW7svrqbuJs

curl -sX POST -H "Content-Type:multipart/form-data" -F chat_id=$ol_tg_user_id -F text="$ol_datetime $1" "https://api.telegram.org/$ol_tg_bot_token/sendMessage" > /dev/null
