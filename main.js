const axios = require('axios');
const md5 = require('md5');
const uuid = require('uuid');

let ROLE = {
  Genshin: {
    game_biz: '',
    region: '',
    game_uid: '',
    nickname: '',
    level: -1,
    is_chosen: false,
    region_name: '',
    is_official: false
  },
  StarRail: {
    game_biz: '',
    region: '',
    game_uid: '',
    nickname: '',
    level: -1,
    is_chosen: false,
    region_name: '',
    is_official: false
  },
  ZZZ: {
    game_biz: '',
    region: '',
    game_uid: '',
    nickname: '',
    level: -1,
    is_chosen: false,
    region_name: '',
    is_official: false
  }
}

const WEB_HOST = 'api-takumi.mihoyo.com'
const APP_VERSION = '2.81.1'

const COMMON__HEADERS = {
  "DS": '',
  "Cookie": '',
  "Host": WEB_HOST,
  "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/${APP_VERSION}`,
  "x-rpc-app_version": APP_VERSION,
  "x-rpc-client_type": 5,
  "Accept-Language": "zh-CN,zh-Hans;q=0.9",
  "Accept": "application/json, text/plain, */*",
}
let ROLE_HEADERS = {
  "Referer": 'https://webstatic.mihoyo.com/',
  "x-rpc-device_id": uuid.v4(),
  "Origin": "https://webstatic.mihoyo.com",
  "x-rpc-challenge": 'null',
  "Accept": "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
};
let SIGN_HEADERS = {
  "Referer": "https://act.mihoyo.com/",
  "x-rpc-device_model": "iPhone14,4",
  "x-rpc-device_id": uuid.v4(),
  "x-rpc-platform": 1,
  "x-rpc-device_name": "iPhone",
  "Origin": "https://act.mihoyo.com",
  "Sec-Fetch-Site": "same-site",
  "Connection": "keep-alive",
  "Content-Type": "application/json;charset=utf-8",
}

const $axios = axios.create({})

const getCookieConfig = async () => {
  // 检查是否有通过环境变量传入的数据, 本地部署需要修改
  const genshinCookies = process.env.GENSHIN_COOKIES;

  if (!genshinCookies) {
    throw new Error("Missing required environment variables.");
  }

  try {
    const genshinCookieArr = genshinCookies ? genshinCookies.split(',') : []
    // 米家游戏可通用Cookie
    return { Genshin: genshinCookieArr, StarRail: genshinCookieArr, ZZZ: genshinCookieArr }
  } catch (error) {
    console.error("Failed to parse environment variable data as JSON:", error.message);
    throw new Error("Failed to parse environment variable data as JSON.");
  }
}

const randomSleep = (min, max) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  console.log(`Sleeping for ${delay} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, delay * 1000))
}

async function getDS() {
  const s = "yUZ3s0Sna1IrSNfk29Vo6vRapdOyqyhB";
  const t = Math.floor(Date.now() / 1e3);
  const r = Math.random().toString(36).slice(-6);
  const c = `salt=${s}&t=${t}&r=${r}`;
  return `${t},${r},${md5(c)}`;
}

const getHeaders = async (Cookie, whichHeader) => {
  return { ...COMMON__HEADERS, ...whichHeader, Cookie, DS: await getDS() }
}

const getRole = async (cookie, gameKey) => {
  const GAME_BIZ = { Genshin: 'hk4e_cn', StarRail: 'hkrpg_cn', ZZZ: 'zzz' }
  const headers = await getHeaders(cookie, ROLE_HEADERS)
  const res = await $axios.request({
    method: 'GET',
    headers,
    url: `https://${WEB_HOST}/binding/api/getUserGameRolesByCookie?game_biz=${GAME_BIZ[gameKey]}`
  }).catch(err => {
    console.error('登录错误\n' + err);
    return 0;
  });
  if (res.data['retcode'] !== 0) {
    console.info('帐号未登录,请检查cookie');
    return 0;
  }
  if ((res?.data?.message === 'OK') && res.data.data.list[0]) {
    ROLE[gameKey] = res.data.data.list[0]
    console.log(`[${gameKey}] 登陆成功 <${ROLE[gameKey].nickname}(${ROLE[gameKey].game_uid})>: `, JSON.stringify(res.data))
  } else {
    ROLE[gameKey] = {
      game_biz: '',
      region: '',
      game_uid: '',
      nickname: '',
      level: -1,
      is_chosen: false,
      region_name: '',
      is_official: false
    }
    console.log(`[${gameKey}] 登陆失败 <未查询到角色>: `, JSON.stringify(res.data))
  }
}

async function Sign_In(cookie, gameKey) {
  const ACT_ID = { Genshin: 'e202311201442471', StarRail: 'e202304121516551', ZZZ: 'e202406242138391' }
  const REGION = { Genshin: 'cn_gf01', StarRail: 'prod_gf_cn', ZZZ: 'prod_gf_cn' }
  const SIGNGAME = { Genshin: 'hk4e', StarRail: 'hkrpg', ZZZ: 'zzz' }

  const headers = await getHeaders(cookie, { ...SIGN_HEADERS, 'x-rpc-signgame': SIGNGAME[gameKey] })
  const data = {
    act_id: ACT_ID[gameKey],
    region: REGION[gameKey],
    uid: ROLE[gameKey].game_uid,
    lang: 'zh-cn'
  }
  const res = await $axios.request({
    method: 'POST',
    headers,
    data,
    url: `https://${WEB_HOST}/event/luna/${SIGNGAME[gameKey]}/sign`
  }).catch(err => {
    console.error('签到错误\n' + err)
  })
  console.log(`<${ROLE[gameKey].nickname}(${ROLE[gameKey].game_uid})>签到${res?.data?.message === 'OK' ? '成功' : '失败'}: `, JSON.stringify(res.data))
}

const doGameSign = async (gameKey) => {
  const CONF = await getCookieConfig()
  const cookieList = CONF[gameKey]
  if (cookieList.length) {
    console.info(`[${gameKey}] 签到开始, 共获取 ${cookieList.length} 位用户\n`)
    for (const cookIndex in cookieList) {
      const cook = cookieList[cookIndex]
      if (cook) {
        console.log(`第 ${Number(cookIndex) + 1} 位用户开始签到...`)
        await getRole(cook, gameKey)
        if (ROLE[gameKey]?.game_uid) {
          await Sign_In(cook, gameKey)
        }
        await randomSleep(3, 9)
      }
    }
    console.info(`[${gameKey}] 签到 结束\n`)
  }
}

async function main() {
  await doGameSign('Genshin')
  await doGameSign('StarRail')
  // await doGameSign('ZZZ')
}

main().then()
