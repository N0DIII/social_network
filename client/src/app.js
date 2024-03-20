const { useEffect, useState } = require('react');
const { BrowserRouter, Route, Routes } = require('react-router-dom');

const { io } = require('socket.io-client');
const socket = io.connect(require('./web_socket_url.js'));

const url = require('./server_url.js');

require('./styles/index.css');

const Registration = require('./components/registration.js').default;
const Login = require('./components/login.js').default;
const Main = require('./components/main.js').default;
const Profile = require('./components/profile.js').default;
const ChangeUserData = require('./components/change_userdata.js').default;
const Friends = require('./components/friends.js').default;
const Album = require('./components/album.js').default;
const Chat = require('./components/chat.js').default;

export default function App() {
    const [userData, setUserData] = useState(false);

    useEffect(() => {
        auth().then(result => {
            setUserData(result);
        })
    }, [])

    async function auth() {
        return fetch(url + '/auth/authorization', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token')}})
            .then(response => response.json())
    }

    return(
        <BrowserRouter>
            <div className='App'>
                <Routes>
                    <Route path='/registration' element={<Registration setUserData={setUserData}/>}/>
                    <Route path='/login' element={<Login setUserData={setUserData}/>}/>

                    <Route path='/' element={<Main userData={userData}/>}/>
                    <Route path='/profile/:id' element={<Profile userData={userData}/>}/>
                    <Route path='/changeUserData/:id' element={<ChangeUserData userData={userData}/>}/>
                    <Route path='/friends' element={<Friends userData={userData}/>}/>
                    <Route path='/album/:id' element={<Album userData={userData}/>}/>
                    <Route path='/chat/:id' element={<Chat userData={userData} socket={socket}/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    )
}