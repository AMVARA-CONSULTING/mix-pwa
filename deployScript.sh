#!/bin/bash
set -x
# set the deployment folder path
deployment_folder=$1
echo $deployment_folder
# save the ip address in a variable
IPADDR=$((ip a s enp6s0 2>/dev/null || ip a s enp0s3 2>/dev/null || ip a s enp0s8 2>/dev/null || ip a s enp0s9 2>/dev/null || ip a s eno1 2>/dev/null || ip a s eno0 2>/dev/null || ip a s ens18 2>/dev/null) | head -n3 | tail -n1 | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/" | sed "s@/@@")

# detect on which server we are
echo $IPADDR | grep -Eq "192\.[0-9]+\.[0-9]+\.[0-9]+" && SERVER="dev"
echo $IPADDR | grep -Eq "109\.[0-9]+\.[0-9]+\.[0-9]+" && SERVER="prod"
echo $IPADDR | grep -Eq "46\.[0-9]+\.[0-9]+\.[0-9]+" && SERVER="qa"

echo $(date)
route=$(pwd)
echo "\$route = $route"
npm install
npm audit fix
## d3-shape Specific fix, replace CanvasPathMethods to CanvasPath ...
## THIS FILE DOES NOT EXIST ANYMORE - RRO - sed -i 's/CanvasPathMethods/CanvasPath/g' ./node_modules/@types/d3-shape/index.d.ts || true
## Insert the build date into impressum
echo pwd
ls -al
# update favicon routes depending on the ip address
echo "We're at $SERVER server..."
## Replace root favicon with the correct server favicon
cp ./src/assets/favicon/$SERVER/favicon.ico ./src/
## Replace favicon on meta tags
sed -Ei "s@\/dev\/@\/$SERVER\/@g" ./src/index.html
if [ "$SERVER" == "prod" ]; then
  sed -Ei "s@https\:\/\/9737ad4391c046aebef4f4b1eb286da0\@sentry\.amvara\.de\/3@https\:\/\/4a0e685ba0524c0daf60c58ab201fb00\@sentry\.amvara\.de\/5@g" ./src/app/app.module.ts
  ## Replace STAGE domain to PROD
  sed -Ei "s@mix\.amvara\.de@mix\-online\.de@g" ./src/index.html
fi
## Replace favicons on manifest
sed -Ei "s@\/dev\/@\/$SERVER\/@g" ./src/manifest.json
## Replace Build Version
d=$(LC_ALL=de_DE.utf8 date '+%d.%m.%Y %H:%M')
sed -i "s/·BuildVersionNº·/$d/g" ./src/app/components/impressum/impressum.component.html
npx ng build --prod --aot --build-optimizer --output-path=dist
ret=$?
if [ $ret -ne 0 ]; then
  exit 1
fi
## Build up mixfront dockers through DockerCompose
# variable deploymentfolder is: /home/amvara/projects/mix3030/mix_front/public_html
sudo mkdir -p $deployment_folder
ls -al $deployment_folder
sudo rm -rf ${deployment_folder}_sic
sudo mv $deployment_folder ${deployment_folder}_sic
sudo mkdir -p $deployment_folder
ls -al $deployment_folder
cd $route
cd dist
# Prevent minify error causing problems in iOS 10.1 - #1916
sed -i 's#(function(n){if(n.target===e)t=!0;else if(!n.target.hasAttribute("nomodule")||!t)return;n.preventDefault()})#function(n){if(n.target===e)t=!0;else if(!n.target.hasAttribute("nomodule")||!t)return;n.preventDefault()}#g' polyfills-nomodule*.js
# Pre-compressing JS, CSS & HTML files with GZIP for lower latency and faster download
find . -type f \( -name '*.js' -o -name '*.css' \) -exec sh -c "gzip < {} > {}.gz" \;
cd ../
sudo cp -rf ./dist/* $deployment_folder
# copy config files
sudo cp -rf conf $deployment_folder/../
# Regenerate build files with AOT compile disabled, for iOS 10
#cd $route
#npx ng build --prod --aot=false --build-optimizer=false --output-path=dist
#cd dist
# Pre-compressing JS, CSS & HTML files with GZIP for lower latency and faster download
#find . -type f \( -name '*.js' -o -name '*.css' \) -exec sh -c "gzip < {} > {}.gz" \;
#sudo mkdir -p $deployment_folder/ios
#cd ../
#sudo cp -rf ./dist/* $deployment_folder/ios
# copy docker-compose file
sudo cp -rf docker-compose.yml $deployment_folder/../
# change to the deployment folder and start docker
cd $deployment_folder/..
sudo docker-compose stop
sudo docker-compose up -d
## Run Tests, $tests is a CI/CD array variable with feature IDs from co.meta
echo $(date)
## causes server overload, get_events.php fetchAll ... up to 20s ... commented, RRO - /scripts/run_test.sh $tests
echo $(date)

set +x