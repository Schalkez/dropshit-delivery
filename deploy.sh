if [ -d /var/www/html/dropshit-delivery ]; then
  rm -rf /var/www/html/dropshit-delivery
fi

npm run build
mv dist /var/www/html/dropshit-delivery