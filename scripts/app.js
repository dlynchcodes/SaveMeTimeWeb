var directionsUrl = 'https://savemetime.xyz/RestRoutesDriving'
var map
var directionsManager

function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }
    return true;
}

function formatParams(params) {
    return '?' + Object
        .keys(params)
        .map(function (key) {
            return key + '=' + encodeURIComponent(params[key])
        })
        .join('&')
}

function sourceSuggestion(suggestionResult) {
    map.entities.clear()
    map.setView({ bounds: suggestionResult.bestView })
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location)
    map.entities.push(pushpin)
    document.getElementById('source').value = suggestionResult.formattedSuggestion
}

function destinationSuggestion(suggestionResult) {
    map.entities.clear()
    map.setView({ bounds: suggestionResult.bestView })
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location)
    map.entities.push(pushpin)
    document.getElementById('destination').value = suggestionResult.formattedSuggestion
}

function GetMap() {
    map = new Microsoft.Maps.Map('#myMap')
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map)
    })
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        var options = {
            maxResults: 4,
            map: map
        }
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#source', '#source-container', sourceSuggestion)
    });
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
        var options = {
            maxResults: 4,
            map: map
        }
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#destination', '#destination-container', destinationSuggestion)
    });
}

function WatchTraffic() {
    let wp0 = document.getElementById('source').value
    let wp1 = document.getElementById('destination').value
    let desiredCommute = document.getElementById('desired-commute').value

    if (!desiredCommute) {
        alert('Desired Commute Time Required')
        return
    }

    let oneTimeParams = {
        'wp0': wp0,
        'wp1': wp1,
        'optmz': 'timeWithTraffic'
    }

    let xhr = new XMLHttpRequest()
    xhr.open('GET', directionsUrl + formatParams(oneTimeParams))
    xhr.send()
    xhr.responseType = 'json'
    xhr.onload = function () {
        if (xhr.status != 200) {
            $('body')
                .toast({
                    class: 'error',
                    title: 'An error occured !',
                    message: `${xhr.status}: ${xhr.statusText}`
                })                
        } else {
            let minutes = Math.round(Number(xhr.response.resourceSets[0].resources[0].travelDurationTraffic) / 60)
            document.getElementById('travel-time').textContent = minutes + ' minutes'
        }
    }


    directionsManager.clearAll()
    // Set Route Mode to driving
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving })
    var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: wp0 })
    var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: wp1 })
    directionsManager.addWaypoint(waypoint1)
    directionsManager.addWaypoint(waypoint2)
    // Set the element in which the itinerary will be rendered
    directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') })
    directionsManager.calculateDirections()

    // function to actually ask the permissions
    function handlePermission(permission) {
        // Whatever the user answers, we make sure Chrome stores the information
        if (!('permission' in Notification)) {
            Notification.permission = permission;
        }

        // set the button to shown or hidden, depending on what the user answers
        if (Notification.permission === 'denied' || Notification.permission === 'default') {
            alert('Cannot display notifications')
        } else {
            if (window.Worker) {
                let params = {
                    'wp0': wp0,
                    'wp1': wp1,
                    'desiredCommute': desiredCommute,
                    'directionsUrl': directionsUrl
                }
                const trafficWatcher = new Worker('scripts/trafficWatcher.js' + formatParams(params))
                trafficWatcher.onmessage = function (data) {
                    document.getElementById('travel-time').textContent = data.data + ' minutes'
                    if (Number(data.data) <= Number(desiredCommute)) {
                        let notificationBody = 'Your estimated travel time is now ' + data.data + ' minutes. It\'s time to leave!'
                        var notification = new Notification('Time to leave!', { body: notificationBody });
                    }

                }
            } else {
                alert('Your browser does not support workers.')
            }
        }
    }

    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
    } else {
        if (checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => {
                    handlePermission(permission);
                })
        } else {
            Notification.requestPermission(function (permission) {
                handlePermission(permission);
            });
        }
    }



}

function GetDirections() {
    let wp0 = document.getElementById('source').value
    let wp1 = document.getElementById('destination').value

    let params = {
        'wp0': wp0,
        'wp1': wp1,
        'optmz': 'timeWithTraffic'
    }

    let xhr = new XMLHttpRequest()
    xhr.open('GET', directionsUrl + formatParams(params))
    xhr.send()
    xhr.responseType = 'json'
    xhr.onload = function () {
        if (xhr.status != 200) {
            $('body')
                .toast({
                    class: 'error',
                    title: 'An error occured !',
                    message: `${xhr.status}: ${xhr.statusText}`
                })  
        } else {
            let minutes = Math.round(Number(xhr.response.resourceSets[0].resources[0].travelDurationTraffic) / 60)
            document.getElementById('travel-time').textContent = minutes + ' minutes'
        }
    }

    directionsManager.clearAll()
    // Set Route Mode to driving
    directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving })
    var waypoint1 = new Microsoft.Maps.Directions.Waypoint({ address: wp0 })
    var waypoint2 = new Microsoft.Maps.Directions.Waypoint({ address: wp1 })
    directionsManager.addWaypoint(waypoint1)
    directionsManager.addWaypoint(waypoint2)
    // Set the element in which the itinerary will be rendered
    directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('printoutPanel') })
    directionsManager.calculateDirections()


}