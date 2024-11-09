-- Adding to server.lua
local players = {}
local shotsFired = {}  -- Store gunshot events

RegisterNetEvent("playerShotFired")
AddEventHandler("playerShotFired", function(coords)
 --   print("playerShotFired")
    -- Store the gunshot with a timestamp to manage old data later
    table.insert(shotsFired, {coords = coords, timestamp = os.time()})
    -- Optionally save to a file
    SaveShotsToFile(false)  -- Pass 'false' to indicate data should be encoded normally
end)

function SaveShotsToFile(clear)
  --     print("saveshotstofile")
    local jsonData
    if clear then
        jsonData = ''  -- If clearing, set data to an empty string
    else
        jsonData = json.encode(shotsFired)  -- Otherwise, encode the data
    end
    SaveResourceFile(GetCurrentResourceName(), "shots.json", jsonData, -1)
end

RegisterNetEvent("webmap:updateInfo")
AddEventHandler("webmap:updateInfo", function(playerInfo)
    players[source] = playerInfo
end)

AddEventHandler("playerDropped", function(reason)
    players[source] = nil
end)

Citizen.CreateThread(function()
    while true do
        prunePlayers()
        TriggerClientEvent("webmap:updateInfo", -1)
        Citizen.Wait(Config.updateInterval)
    end
end)
-- Emit gunshot data to clients
Citizen.CreateThread(function()
    while true do
        TriggerClientEvent("webmap:updateShots", -1, shotsFired)
        Citizen.Wait(1000)  -- update every second
    end
end)



function prunePlayers()
    for player, info in pairs(players) do
        if not GetPlayerEndpoint(player) then
            players[player] = nil
        end
    end
end

-- Clear the shots.json file every minute by saving an empty string
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(60000)  -- Wait for one minute
        SaveShotsToFile(true)  -- Pass 'true' to save an empty string
    end
end)

-- HTTP Handlers
SetHttpHandler(exports.httpmanager:createHttpHandler {
    routes = {
        ["^/info.json$"] = function(req, res, helpers)
            local data = {
                serverName = GetConvar("sv_projectName", GetConvar("sv_hostname", "Server Name")),
                players = players
            }
            res.sendJson(data)
        end,
        ["^/config.json$"] = function(req, res, helpers)
            res.sendJson({
                gameName = GetConvar("gamename", "gta5"),
                displayWeather = Config.displayWeather
            })
        end,
        ["^/shots.json$"] = function(req, res, helpers)
            local data = {
                shots = shotsFired or {}
            }
            res.sendJson(data)
        end
    }
})