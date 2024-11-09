-- Adding to client.lua
RegisterNetEvent("playerShotFired")

-- This thread listens for the player shooting and sends the coordinates to the server.
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)  -- Listening on each frame
        if IsPedShooting(PlayerPedId()) then
            local coords = GetEntityCoords(PlayerPedId())
            -- Print for debugging; remove in production
            print("is Shooting at: ", coords)
            -- Trigger the server event to handle the gunshot coordinates
            TriggerServerEvent("playerShotFired", coords)
        end
    end
end)

RegisterNetEvent("webmap:updateInfo")

AddEventHandler("webmap:updateInfo", function()
    local player = NDCore.getPlayer() -- Fetch player data
    if player and player.job then
        if table.includes(Config.Allowed, player.job) then  -- Check if the job is in the allowed list
            local playerPed = PlayerPedId()
            TriggerServerEvent("webmap:updateInfo", {
                name = player.fullname,  -- Assuming fullname is correctly stored in the player data
                dept = player.job,
                coords = GetEntityCoords(playerPed),
                heading = GetEntityHeading(playerPed),
                health = GetEntityHealth(playerPed)
            })
        else
        --       print("Your job is not allowed to update information.")
        end
    else
    --       print("No player data found or job not specified.")
    end
end)

-- Helper function to check if a value exists in a table
function table.includes(table, value)
    for _, v in pairs(table) do
        if v == value then
            return true
        end
    end
    return false
end


