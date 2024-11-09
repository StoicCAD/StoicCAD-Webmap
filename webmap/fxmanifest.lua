fx_version "cerulean"
games {"gta5", "rdr3"}
rdr3_warning "I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships."
lua54 'yes'
name "webmap"
author "kibukj"
description "Live map for FiveM and RedM servers"
url "https://github.com/kibook/webmap"

dependency "httpmanager" -- https://github.com/kibook/httpmanager

shared_scripts {
    "@ND_Core/init.lua",
	"config.lua",
	'@ox_lib/init.lua',
}
server_scripts {
	
	"server.lua"
}

client_script "client.lua"
