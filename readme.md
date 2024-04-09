create own certificate in linux

openssl req -x509 -newkey rsa:2048 -nodes -keyout gb_key.pem -out cert.pem -days 365

openssl pkcs12 -export -out GBCert.p12 -inkey gb_key.pem -in cert.pem