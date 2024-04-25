const { useEffect, useState } = require('react');
const { BrowserRouter, Route, Routes } = require('react-router-dom');
const url = require('./server_url.js');

const { io } = require('socket.io-client');
const socket = io.connect(url);

require('./styles/index.css');
require('./styles/list.css');

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
const Groups = require('./components/groups.js').default;
const Group = require('./components/group.js').default;
const MobileMenu = require('./components/mobile_menu.js').default;

export default function App() {
    const [userData, setUserData] = useState(false);
    const [error, setError] = useState(false);
    const [confirm, setConfirm] = useState([false, () => console.log('Вы подтвердили действие')]);
    const [isMobile, setIsMobile] = useState(/Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent));
    const [showMobileMenu, setShowMobileMenu] = useState(true);

    useEffect(() => {
        auth().then(result => {
            setUserData(result);
            if(result._id != undefined) socket.emit('online', { id: result._id });
        })

        window.addEventListener('resize', () => {
            setIsMobile(/Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent));
        })
    }, [])

    async function auth() {
        return fetch(url + '/auth/authorization', {method: 'post', headers: {'Content-Type': 'application/json; charset=utf-8', 'authorization': localStorage.getItem('token')}})
        .then(response => response.json())
    }

    return(
        <BrowserRouter>
            <div className='App'>
                {isMobile && showMobileMenu && <MobileMenu id={userData._id}/>}
                {userData && !isMobile && <RightMenu id={userData._id} username={userData.username}/>}
                {userData && !isMobile && <LeftMenu id={userData._id} socket={socket} setError={setError}/>}
                <Error params={[error, setError]}/>
                <Confirm confirm={[confirm, setConfirm]}/>
                <Routes>
                    <Route path='*' element={<NotFound/>}/>
                    <Route path='/not_found' element={<NotFound/>}/>
                    {isMobile && <Route path='/chats' element={<LeftMenu id={userData._id} socket={socket} setError={setError}/>}/>}

                    <Route path='/registration' element={<Registration setUserData={setUserData}/>}/>
                    <Route path='/login' element={<Login setUserData={setUserData}/>}/>

                    <Route path='/' element={<Main userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/profile/:id' element={<Profile userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/changeUserData/:id' element={<ChangeUserData userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/friends' element={<Friends userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/album/:id' element={<Album userData={userData} socket={socket} setError={setError} setConfirm={setConfirm}/>}/>
                    <Route path='/chat/:id' element={<Chat userData={userData} socket={socket} setError={setError} setConfirm={setConfirm} isMobile={isMobile} showMobile={setShowMobileMenu}/>}/>
                    <Route path='/groups' element={<Groups userData={userData} setError={setError}/>}/>
                    <Route path='/group/:id' element={<Group userData={userData} setError={setError} setConfirm={setConfirm}/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    )
}