const { useEffect, useState } = require('react');
const { useNavigate, useParams, Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');
const server = require('../server.js');

require('../styles/profile.css');

const plusImg = require('../images/plus.png');
const crossImg = require('../images/cross.png');
const deleteImg = require('../images/delete.png');

const Button = require('./button.js').default;
const Input = require('./input.js').default;
const Error = require('./error.js').default;

export default function Profile(props) {
    const { userData } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [username, setUsername] = useState('');
    const [birthday, setBirthday] = useState(false);

    const [albums, setAlbums] = useState([]);
    const [showAddAlbum, setShowAddAlbum] = useState(false);
    const [albumName, setAlbumName] = useState('');

    const [friendStatus, setFriendStatus] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        server('/user/getUserData', { id, myId: userData._id })
        .then(result => {
            if(!result) return navigate('/not_found');

            setUsername(result.user.username);
            if(result.user.birthday) setBirthday(getAge(result.user.birthday.split('T')[0]));
            setFriendStatus(result.isFriend);
        })

        server('/file/getAlbums', { id })
        .then(result => {
            setAlbums(result);
        })
    }, [userData])

    function getAge(date) {
        let nowDate = new Date();
        let birthdayDate = new Date(date);
        let retDate = Math.trunc((nowDate - birthdayDate) / 31622400000);
        let lastNum = Number(String(retDate)[String(retDate).length - 1]);

        return retDate + (lastNum > 0 && lastNum < 4 ? ' год' : ' лет');
    }

    function reqFriend(req) {
        server(req, {id, myId: userData._id})
        .then(result => {
            if(result) setFriendStatus(result.status);
        })
    }

    function addAlbum() {
        server('/file/addAlbum', { id, name: albumName })
        .then(result => {
            if(result) {
                setAlbums([...albums, result]);
                setShowAddAlbum(false);
            }
            else setError(true);
        })
    }

    function deleteAlbum(id) {
        server('/file/deleteAlbum', { albumID: id, userID: userData._id })
        .then(result => {
            if(result) {
                server('/file/getAlbums', { id: userData._id })
                .then(result => {
                    setAlbums(result);
                })
            }
            else setError(true);
        })
    }

    function createChat() {
        server('/chat/createChat', { userID1: userData._id, userID2: id})
        .then(result => {
            if(result) navigate(`/chat/${result._id}`);
            else setError(true);
        })
    }

    return(
        <div className='page page_noTitle'>
            <Error params={[error, setError]}/>

            <div className='profile_userdata'>
                <img className='profile_avatar' src={`${serverUrl}/users/${id}/avatar.png`}/>

                <div className='profile_userdata_info'>
                    <div className='profile_userdata_username'>{username}</div>
                    {birthday && <div className='profile_userdata_birthday'>{birthday}</div>}
                </div>

                {userData._id != id &&
                <div className='profile_userdata_buttons'>
                    {friendStatus == 0 && <Button title='Добавить в друзья' onclick={() => reqFriend('/user/addFriend')}/>}
                    {friendStatus == 1 && <Button title='Приглашение отправлено'/>}
                    {friendStatus == 2 && <Button title='Принять приглашение' onclick={() => reqFriend('/user/acceptFriend')}/>}
                    {friendStatus == 3 && <Button title='Удалить из друзей' onclick={() => reqFriend('/user/deleteFriend')}/>}
                    <Button title='Написать' onclick={createChat}/>
                </div>}

                {userData._id == id &&
                <div className='profile_userdata_buttons'>
                    <Button title='Изменить' onclick={() => navigate(`/changeUserData/${userData._id}`)}/>
                </div>}
            </div>

            <div className='profile_albums_wrapper'>
                <div className='profile_albums_title'>
                    Альбомы
                    {userData._id == id && <img className='profile_albums_addAlbumButton' src={!showAddAlbum ? plusImg : crossImg} onClick={() => setShowAddAlbum(!showAddAlbum)}/>}
                </div>

                {showAddAlbum && 
                <div className='profile_albums_addAlbum'>
                    <Input type='text' placeholder='Без названия' setValue={setAlbumName}/>
                    <Button title='Сохранить' onclick={addAlbum}/>
                </div>}

                <div className='profile_albums_scroll'>
                    <div className='profile_albums'>
                        {albums.map((album, i) => 
                            <div className='profile_album' key={i}>
                                {userData._id == id && <img className='profile_album_delete' src={deleteImg} onClick={() => deleteAlbum(album._id)}/>}
                                <div className='profile_album_name'>{album.name}</div>
                                <Link className='profile_album_link' to={`/album/${album._id}`}>
                                    {album.cover != undefined && <img className='profile_album_preview' src={serverUrl + album.cover}/>}
                                </Link>
                            </div>
                        )}
                        {albums.length == 0 && <div className='profile_noAlbums'>Нет альбомов</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}