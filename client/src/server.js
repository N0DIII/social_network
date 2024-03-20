const serverUrl = require('./server_url.js');

module.exports = async (url, body) => {
    return fetch(serverUrl + url, {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8'}, body: JSON.stringify(body)})
        .then(response => response.json())
}