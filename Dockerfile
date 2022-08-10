FROM node:alpine

WORKDIR /oauth

COPY . /oauth

ENV CLIENT_ID=apRGiZToTQtFxVezkypoXOv1LnLbbZgXFxcnlZPI \
    CLIENT_SECRET=zNTn2ag9jbEGDWsfjBbpB9bsGPrHjeosEJ7WnBd0zHwtprIxoWgeWR44lNikG5V6zSGDsHkz2VqRddkx78xhIogOpL5eOKbGltxKRGldbEYwyoKO5hMCDp70bbGQSRCX \
    AUTHORIZE_URI=https://arkid.vtwo.longguikeji.com/api/v1/tenant/84c6e0f9-f777-4bba-89f1-67c2274b1f78/oauth/authorize/ \
    ACCESS_TOKEN_URI=https://arkid.vtwo.longguikeji.com/api/v1/tenant/84c6e0f9-f777-4bba-89f1-67c2274b1f78/oauth/token/ \
    USERINFO_URI=https://arkid.vtwo.longguikeji.com/api/v1/tenant/84c6e0f9-f777-4bba-89f1-67c2274b1f78/oauth/userinfo/ \
    REDIRECT_URI=http://localhost:8000/oauth/redirect

RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g" /etc/apk/repositories &&\
    apk update &&\
    apk add --no-cache tini &&\
    npm install

CMD tini -- node index.js
