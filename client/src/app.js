import { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './style.css';

import { Context } from './components/context';
import Loading from './pages/loading';
import Error from './components/error';
import Confirm from './components/confirm';
import Success from './components/success';
import Fullscreen from './components/fullscreen';
import Login from './pages/login';
import Registration from './pages/registration';
import Posts from './pages/posts';
import Profile from './pages/profile_user';
import GroupProfile from './pages/profile_group';
import Album from './pages/album';
import Friends from './pages/friends';
import Groups from './pages/groups';
import Chat from './pages/chat';
import RightMenu from './pages/right_menu';
import LeftMenu from './pages/left_menu';

export default function App() {
    const { isSign } = useContext(Context);

    return(
        <BrowserRouter>
            <div className='App'>
                {!isSign &&
                <Routes>
                    <Route path='*' element={<Loading />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/registration' element={<Registration />} />
                </Routes>}

                {isSign &&
                <Routes>
                    <Route path='/' element={<Posts />} />
                    <Route path='/profile/:id' element={<Profile />} />
                    <Route path='/album/:id' element={<Album />} />
                    <Route path='/friends' element={<Friends />} />
                    <Route path='/groups' element={<Groups />} />
                    <Route path='/group/:id' element={<GroupProfile />} />
                    <Route path='/chat/:id' element={<Chat />} />
                </Routes>}

                {isSign && <LeftMenu />}
                {isSign && <RightMenu />}
                <Error />
                <Confirm />
                <Success />
                <Fullscreen />
            </div>
        </BrowserRouter>
    )
}