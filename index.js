// Fill in your client ID and client secret that you obtained
// while registering the application

const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const route = require('koa-route');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs'); // 引入fs模块


const stringUtils = require('./src/utils/stringsUtils');

const app = new Koa();

const main = serve(path.join(__dirname + '/public'));

// oauth client 在oauth server的配置信息
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const authorize_uri = process.env.AUTHORIZE_URI;
const access_token_uri = process.env.ACCESS_TOKEN_URI;
const userinfo_uri = process.env.USERINFO_URI;
const redirect_uri = process.env.REDIRECT_URI;

// const oauthInfo = qs.stringify({
//   'client_id': `${process.env.CLIENT_ID}`,
//   'client_secret': `${process.env.CLIENT_SECRET}`,
//   'authorize_uri': `${process.env.AUTHORIZE_URI}`,
//   'access_token_uri': `${process.env.ACCESS_TOKEN_URI}`,
//   'userinfo_uri': `${process.env.USERINFO_URI}`,
//   'redirect_uri': `${process.env.REDIRECT_URI}`
// });

// 先判断配置文件是否存在，如果不存在则创建出来
// 创建之后再判断是否有环境变量，如果有则写入
// fs.access("./config.txt", function(exists) {
//   console.log(exists ? "创建成功" : "创建失败");
// });

const configFile = '/etc/conf.d/config.json';

fs.access(configFile, fs.constants.F_OK, (err) => {
  console.log(`${configFile} ${err ? '不存在' : '存在'}`);
  //如果配置文件不存在，则创建并写入配置
  if(err){
    const oauthInfo = JSON.stringify({
      'client_id': `${process.env.CLIENT_ID}`,
      'client_secret': `${process.env.CLIENT_SECRET}`,
      'authorize_uri': `${process.env.AUTHORIZE_URI}`,
      'access_token_uri': `${process.env.ACCESS_TOKEN_URI}`,
      'userinfo_uri': `${process.env.USERINFO_URI}`,
      'redirect_uri': `${process.env.REDIRECT_URI}`
    },"","\t")

    fs.writeFile(configFile, oauthInfo, { 'flag': 'a' }, function(err2) {
      if (err2) {
          throw err2;
      } else{
        console.log('文件不存在，已创建')
      }
    })
  //如果配置文件已经存在，则输出到console
  } else {
    fs.readFile(configFile, 'utf8' , (err3, data) => {
      if (err3) {
        console.error(err3)
        return
      }
      console.log(data)
    })
  }

});


// //将配置持久化
// fs.writeFile('./config.txt', oauthInfo, { 'flag': 'a' }, function(err) {
//   if (err) {
//       throw err;
//   }
// })

const oauthinfo = async ctx => {
  
  try {
    const data = fs.readFileSync(configFile, 'utf8')
    console.log(data)
    const dataj = JSON.parse(data);
    console.log(dataj.redirect_uri);
    console.log(dataj.authorize_uri);
    console.log(dataj.client_id);
    console.log(dataj.client_secret);
    console.log(dataj.access_token_uri);
    console.log(dataj.userinfo_uri);
      // ctx.response.type
    ctx.response.type = 'application/json';
    ctx.response.body = {
      client_id: `${dataj.client_id}`,
      authorize_uri: `${dataj.authorize_uri}`,
      redirect_uri: `${dataj.redirect_uri}`
    };
  } catch (err) {
    console.error(err)
  }


};

const oauth = async ctx => {
  const requestToken = ctx.request.query.code;
  console.log('authorization code:', requestToken);
  const configdata = fs.readFileSync(configFile, 'utf8')
  const dataj = JSON.parse(configdata);
    // console.log(dataj.redirect_uri);
    // console.log(dataj.authorize_uri);
    // console.log(dataj.client_id);
    // console.log(dataj.client_secret);
    // console.log(dataj.access_token_uri);
    // console.log(dataj.userinfo_uri);
  //basic token = base64(client_id:client_secret)
  const basicTokenStr = `${dataj.client_id}:${dataj.client_secret}`;
  const basicToken = stringUtils.stringToBase64(basicTokenStr);

  const data = qs.stringify({
    'state': 'xyz',
    'client_id': `${dataj.client_id}`,
    'client_secret': `${dataj.client_secret}`,
    'grant_type': 'authorization_code',
    'code': `${requestToken}`
  });
  const config = {
    method: 'post',
    url: `${dataj.access_token_uri}`,
    headers: { 
      'Authorization': `Basic ${basicToken}`, 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };
  

  // 发送获取 access_token 的请求
  const tokenResponse = await axios(config);

	//const tokenResponse = await axios({
  	//  method: 'post',
  	//  url: 'https://arkid.demo.longguikeji.com/oauth/token/?' +
  	//    `client_id=${clientID}&` +
  	//    `client_secret=${clientSecret}&` +
  	//    `code=${requestToken}`,
  	//  headers: {
  	//    accept: 'application/json'
  	//  }
  	//});

  const accessToken = tokenResponse.data.access_token;
  console.log(`access token: ${accessToken}`);

  // 发送获取 userinfo的请求
  const result = await axios({
    method: 'get',
    url: `${dataj.userinfo_uri}`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });
  console.log(result.data);
  const name = result.data.data.user.name;
  // ss = body.exp.toUTCString();
  // ctx.response.headers('Set-Cookie', 'token=asdf')
// res.cookie('id_token' ,body.id_token, {expires: s});
ctx.response.cookie = {
  token: "haha"
}
// res.redirect(302, 'http://localhost:8080');
  console.log(ctx.response)
  ctx.response.redirect(`/#/third_part_callback?name=${name}&token=${accessToken}`);
};

//更新 oauth2.0 的配置
const oauthconfig = async ctx => {
  const config = ctx.request.body;
  const configj = JSON.stringify(config);
  fs.writeFile(configFile, configj, '', function(err2) {
    if (err2) {
        throw err2;
    } else{
      console.log('配置文件已经更新')
    }
  })
  ctx.response.body = {
    state: 'success',
    msg: '配置文件已经更新'
  };
};

app.use(main);
app.use(bodyParser())
// redi
app.use(route.get('/oauth/redirect', oauth));
// oauth info
app.use(route.get('/oauth/info', oauthinfo));

app.use(route.put('/oauth/info', oauthconfig));

app.listen(80);
