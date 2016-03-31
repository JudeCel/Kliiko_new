module.exports = {
  mode: process.env.CHAT_CONF_MODE,
  conflict: process.env.CHAT_CONF_CONFLICT,
  copyright: process.env.CHAT_CONF_COPYRIGHT,
  port: process.env.CHAT_CONF_PORT,
  domain: process.env.CHAT_CONF_DOMAIN,
  paths: {
    fsPath: process.env.CHAT_CONF_PATHS_FS_PATH,
    urlPath: process.env.CHAT_CONF_PATHS_URL_PATH,
    serverPath: process.env.CHAT_CONF_PATHS_SERVER_PATH,
    configPath: process.env.CHAT_CONF_PATHS_CONFIG_PATH,
    adminPath: process.env.CHAT_CONF_PATHS_ADMIN_PATH,
    chatRoomPath: process.env.CHAT_CONF_PATHS_CHAT_ROOM_PATH,
    convertPath: process.env.CHAT_CONF_PATHS_CONVERT_PATH,
    identifyPath: process.env.CHAT_CONF_PATHS_IDENTIFY_PATH
  }
}
