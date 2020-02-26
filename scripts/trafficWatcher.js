function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + params[key]
        })
        .join("&")
}

var parameters = {}
location.search.slice(1).split("&").forEach(function (key_value) { var kv = key_value.split("="); parameters[kv[0]] = kv[1]; })
var searchParams = formatParams({
    'wp0': parameters.wp0,
    'wp1': parameters.wp1,
    'optmz': 'timeWithTraffic'
})
parameters.directionsUrl = decodeURIComponent(parameters.directionsUrl)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function update() {
    while (true) {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', parameters.directionsUrl + searchParams)
        xhr.send()
        xhr.responseType = 'json'
        xhr.onload = function () {
            if (xhr.status != 200) {
                postMessage(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else {
                let minutes = Math.round(Number(xhr.response.resourceSets[0].resources[0].travelDurationTraffic) / 60)
                postMessage(minutes)
            }
        }
        await sleep(120000)
    }
}
update()
