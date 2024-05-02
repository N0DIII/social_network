const url = require('./server_url');

async function auth() {
    return fetch(url + '/auth/authorization', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token')}})
    .then(response => response.json())
}

export { auth }