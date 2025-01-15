if [ -d /var/www/html/dropship-delivery/dist ]; then
  rm -rf /var/www/html/dropship-delivery/dist
fi

npm run build
mv dist /var/www/html/dropship-delivery