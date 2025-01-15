if [ -d /var/www/html/dropshit-delivery/dist ]; then
  rm -rf /var/www/html/dropshit-delivery/dist
fi

npm run build
mv dist /var/www/html/dropshit-delivery