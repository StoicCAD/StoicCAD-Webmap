    // Select map element
    const mapElement = document.getElementById('map');

    // Initialize zoom level
    let zoomLevel = 1;

    // Initialize map position
    let mapPosition = { x: 0, y: 0 };

    // Function to apply zoom
    function applyZoom() {
        mapElement.style.transform = `scale(${zoomLevel}) translate(${mapPosition.x}px, ${mapPosition.y}px)`;
        mapElement.style.transformOrigin = 'top left'; // Ensures zooming from top-left corner
    }

    // Function to handle mouse wheel zoom
    function handleMouseWheel(event) {
        event.preventDefault(); // Prevent default scroll behavior

        const zoomFactor = 0.1; // How much zoom in/out per wheel scroll
        if (event.deltaY < 0) {
            zoomLevel += zoomFactor; // Scroll up: zoom in
        } else {
            zoomLevel = Math.max(0.5, zoomLevel - zoomFactor); // Scroll down: zoom out, but not below 0.5
        }

        applyZoom();
    }

    // Function to handle mouse drag
    let isDragging = false;
    let startX, startY;

    function handleMouseDown(event) {
        isDragging = true;
        startX = event.clientX - mapPosition.x;
        startY = event.clientY - mapPosition.y;
        mapElement.style.cursor = 'grabbing'; // Change cursor to grabbing
    }

    function handleMouseMove(event) {
        if (isDragging) {
            mapPosition.x = event.clientX - startX;
            mapPosition.y = event.clientY - startY;
            applyZoom(); // Apply both zoom and position
        }
    }

    function handleMouseUp() {
        isDragging = false;
        mapElement.style.cursor = 'grab'; // Change cursor back to grab
    }

    // Attach event listeners
    mapElement.addEventListener('wheel', handleMouseWheel);
    mapElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        zoomLevel += 0.1;
        applyZoom();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        zoomLevel = Math.max(0.5, zoomLevel - 0.1);
        applyZoom();
    });

    /* Map settings for FiveM */
    const gta5Map = {
        width: 12340,
        height: 12200,
        xOffset: 10390,
        yOffset: 12150
    };

    /* Radius of the entire in-game world. */
    const mapRadius = 16000;

    /* The number of in-game distance units wide the map graphic is. */
    let mapWidth = 0;

    /* The number of in-game distance units tall the map graphic is. */
    let mapHeight = 0;

    /* The number of in-game distance units the map graphic is offset from the minimum X coordinate. */
    let mapXOffset = 0;

    /* The number of in-game distance units the map graphic is offset from the minimum Y coordinate. */
    let mapYOffset = 0;

    /* How often to fetch updates to the map. */
    const updateInterval = 5000;

    /* URL to get configuration from. */
    const configUrl = 'config.json';

    /* URL to fetch server info from. */
    const updateUrl = 'info.json';

    let customPoints = [];

    window.addEventListener("message", function(event) {
        let data = event.data;
        if (data.type === "addBlip") {
            addCustomPoint(data.name, data.x, data.y, data.z);
        }
    });

    window.addEventListener("message", function(event) {
        if (event.data.type === "updateShots") {
            updateShotBlips(event.data.shots);
        }
    });

    function updateShotBlips(shots) {
        const shotContainer = document.getElementById('shot-blips');
        shotContainer.innerHTML = '';  // Clear existing blips

        shots.forEach(shot => {
            let shotBlip = document.createElement('div');
            shotBlip.className = 'blip shot';
            let left   = (shot.coords.x + mapRadius - mapXOffset) / mapWidth * 100;
            let bottom = (shot.coords.y + mapRadius - mapYOffset) / mapHeight * 100;

            shotBlip.style.left = `${left}%`;
            shotBlip.style.bottom = `${bottom}%`;

            shotContainer.appendChild(shotBlip);
        });
    }

    function mapOnMouseMove(event) {
        var width  = event.clientX / this.offsetWidth;
        var height = Math.abs(event.clientY - this.offsetHeight) / this.offsetHeight;

        var x = width  * mapWidth  + mapXOffset - mapRadius
        var y = height * mapHeight + mapYOffset - mapRadius

        document.getElementById("coords").innerHTML = `${x.toFixed(3)}, ${y.toFixed(3)}`;
    }

    function tabButtonOnClick(event) {
        document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
        document.querySelectorAll(".tab-button").forEach(button => button.className = "tab-button");
        document.getElementById(this.getAttribute("data-tab")).style.display = "block";
        this.className = "tab-button active";
    }

    function addBlip(x, y, z, heading, blipClass, tag) {
        let blip = document.createElement('div');

        blip.className = blipClass;

        let left   = (x + mapRadius - mapXOffset) / mapWidth * 100;
        let bottom = (y + mapRadius - mapYOffset) / mapHeight * 100;

        if (left < 0) {
            left = 0;
        } else if (left > 100) {
            left = 100;
        }

        if (bottom < 0) {
            bottom = 0;
        } else if (bottom > 100) {
            bottom = 100;
        }

        blip.style.left = `${left}%`;
        blip.style.bottom = `${bottom}%`;

        blip.style.transform = `rotate(-${heading}deg)`;

        let blipTag = document.createElement('div');
        blipTag.className = 'blip-tag';
        blipTag.style.left = `${left}%`;
        blipTag.style.bottom = `${bottom}%`;

        if (typeof tag == 'string') {
            blipTag.innerHTML = tag;
        } else {
            tag.forEach(e => blipTag.appendChild(e));
        }

        document.getElementById('blips').appendChild(blip);
        document.getElementById('blip-tags').appendChild(blipTag);
    }

    function updateMap() {
        fetch(updateUrl).then(resp => resp.json()).then(info => {
            document.title = `${info.serverName} Live Map`;

            var serverName = document.getElementById('server-name');

            serverName.innerHTML = info.serverName;

            var playerList = document.getElementById('player-list');
            var blips = document.getElementById('blips');
            var blipTags = document.getElementById('blip-tags');

            playerList.innerHTML = '';
            blips.innerHTML = '';
            blipTags.innerHTML = '';

            Object.keys(info.players).forEach(player => {
                var playerInfo = info.players[player];

                if (playerInfo) {
                    var playerDiv = document.createElement('div');
                    playerDiv.className = 'player';

                    var playerIdDiv = document.createElement('div');
                    playerIdDiv.className = 'player-id';
                    playerIdDiv.innerHTML = player;

                    var playerNameDiv = document.createElement('div');
                    playerNameDiv.className = 'player-name';
                    playerNameDiv.innerHTML = playerInfo.name;

                    var playerHealthDiv = document.createElement('div');
                    playerHealthDiv.className = 'player-health';

                    var playerHealthIconDiv = document.createElement('div');
                    playerHealthIconDiv.className = 'player-health-icon';
                    playerHealthIconDiv.innerHTML = '<i class="fas fa-heart"></i>';

                    var playerHealthValueDiv = document.createElement('div');
                    playerHealthValueDiv.className = 'player-health-value';
                    playerHealthValueDiv.innerHTML = playerInfo.health;

                    playerHealthDiv.appendChild(playerHealthIconDiv);
                    playerHealthDiv.appendChild(playerHealthValueDiv);

                    playerDiv.appendChild(playerIdDiv);
                    playerDiv.appendChild(playerNameDiv);
                    playerDiv.appendChild(playerHealthDiv);
                    playerList.appendChild(playerDiv);

                    let blipClass = playerInfo.health == 0 ? 'blip dead' : 'blip';
                    let heading = playerInfo.health == 0 ? 0 : playerInfo.heading;

                    var blipTagPlayerName = document.createElement('div');
                    blipTagPlayerName.className = 'player-name';
                    blipTagPlayerName.innerHTML = playerInfo.name;

                    var blipTagPlayerHealth = document.createElement('div');
                    blipTagPlayerHealth.className = 'player-health';

                    var blipTagPlayerHealthIcon = document.createElement('div');
                    blipTagPlayerHealthIcon.className = 'player-health-icon';
                    blipTagPlayerHealthIcon.innerHTML = '<i class="fas fa-heart"></i>';

                    var blipTagPlayerHealthValue = document.createElement('div');
                    blipTagPlayerHealthValue.className = 'player-health-value';
                    blipTagPlayerHealthValue.innerHTML = playerInfo.health;

                    blipTagPlayerHealth.appendChild(blipTagPlayerHealthIcon);
                    blipTagPlayerHealth.appendChild(blipTagPlayerHealthValue);

                    addBlip(playerInfo.coords.x, playerInfo.coords.y, playerInfo.coords.z, heading, blipClass, [blipTagPlayerName, blipTagPlayerHealth]);
                }
            });

            customPoints.forEach(point => {
                addBlip(point.x, point.y, point.z, 0, 'blip pin', point.name);
            });

            // Fetch gunshot data
            fetch('webmap/shots.json').then(response => response.json()).then(data => {
                updateShotBlips(data.shots);
            });
        });
    }

    function addCustomPoint(name, x, y, z) {
        customPoints.push({name: name, x: x, y: y, z: z});
    }

    window.addEventListener("load", event => {
        let map = document.getElementById('map');

        map.addEventListener("mousemove", mapOnMouseMove);

        document.querySelectorAll("#tab-bar button").forEach(button => button.addEventListener("click", tabButtonOnClick));

        let url = new URL(window.location);
        let x = url.searchParams.get("x");
        let y = url.searchParams.get("y");
        let z = url.searchParams.get("z");

        if (x && y && z) {
            addCustomPoint(`${x}, ${y}, ${z}`, parseFloat(x), parseFloat(y), parseFloat(z));
        }

        fetch(configUrl).then(resp => resp.json()).then(resp => {
            if (resp.gameName == "gta5") {
                document.querySelectorAll('.tab-button').forEach(e => e.style.fontFamily = "Chinese Rocks");
                document.body.style.backgroundColor = '#d4b891';
                map.style.backgroundImage = 'url("gta5/map.jpg")';

                mapWidth = gta5Map.width;
                mapHeight = gta5Map.height;
                mapXOffset = gta5Map.xOffset;
                mapYOffset = gta5Map.yOffset;

            } else {
                document.querySelectorAll('.tab-button').forEach(e => e.style.fontFamily = "Chinese Rocks");
                document.body.style.backgroundColor = '#d4b891';
                map.style.backgroundImage = 'url("rdr3/map.jpg")';

                // Ensure rdr3Map is defined if using rdr3
                mapWidth = rdr3Map.width;
                mapHeight = rdr3Map.height;
                mapXOffset = rdr3Map.xOffset;
                mapYOffset = rdr3Map.yOffset;
            }
            updateMap();
            setInterval(updateMap, updateInterval);
        });
    });