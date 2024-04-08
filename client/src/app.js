const { useEffect, useState } = require('react');
const { BrowserRouter, Route, Routes } = require('react-router-dom');

const { io } = require('socket.io-client');
const socket = io.connect(require('./web_socket_url.js'));

const url = require('./server_url.js');

require('./styles/index.css');

const RightMenu = require('./components/right_menu.js').default;
const LeftMenu = require('./components/left_menu.js').default;
const Registration = require('./components/registration.js').default;
const Login = require('./components/login.js').default;
const Main = require('./components/main.js').default;
const Profile = require('./components/profile.js').default;
const ChangeUserData = require('./components/change_userdata.js').default;
const Friends = require('./components/friends.js').default;
const Album = require('./components/album.js').default;
const Chat = require('./components/chat.js').default;
const NotFound = require('./components/not_found.js').default;
const Error = require('./components/error').default;
const Confirm = require('./components/confirm.js').default;

export default function App() {
    const [userData, setUserData] = useState(false);
    const [error, setError] = useState(false);
    const [confirm, setConfirm] = useState([false, () => console.log('Вы подтвердили действие')]);

    useEffect(() => {
        auth().then(result => {
            setUserData(result);
            if(result._id != undefined) socket.emit('online', { id: result._id });
        })
    }, [])

    async function auth() {
        return fetch(url + '/auth/authorization', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token')}})
            .then(response => response.json())
    }

    return(
        <BrowserRouter>
            <div className='App'>
                {userData && <RightMenu id={userData._id} username={userData.username}/>}
                {userData && <LeftMenu id={userData._id} socket={socket}/>}
                <Error params={[error, setError]}/>
                <Confirm confirm={[confirm, setConfirm]}/>
                <Routes>
                    <Route path='*' element={<NotFound/>}/>
                    <Route path='/not_found' element={<NotFound/>}/>

                    <Route path='/registration' element={<Registration setUserData={setUserData}/>}/>
                    <Route path='/login' element={<Login setUserData={setUserData}/>}/>

                    <Route path='/' element={<Main userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/profile/:id' element={<Profile userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/changeUserData/:id' element={<ChangeUserData userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/friends' element={<Friends userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/album/:id' element={<Album userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/chat/:id' element={<Chat userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    )
}