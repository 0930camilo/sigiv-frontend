FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# 👇 OJO AQUÍ (browser)
COPY dist/sigiv-web-ui/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
