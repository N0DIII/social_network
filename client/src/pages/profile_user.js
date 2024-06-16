import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import Input from '../components/input';
import Button from '../components/button';
import Search from '../components/search';
import LoadAvatar from '../components/load_avatar';
import Select from '../components/select';
import Datepicker from '../components/datepicker';
import Post from '../components/post';
import FilesInput from '../components/input_files';

export default function Profile() {
    const { userData, setUserData, setError, setConfirm, socket } = useContext(Context);
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [search, setSearch] = useState('');
    const [showChange, setShowChange] = useState(false);
    const [avatar, setAvatar] = useState('');
    const [username, setUsername] = useState('');
    const [sex, setSex] = useState('');
    const [birthday, setBirthday] = useState('');
    const [friendStatus, setFriendStatus] = useState(0);
    const [albums, setAlbums] = useState(null);
    const [albumName, setAlbumName] = useState('');
    const [showAddAlbum, setShowAddAlbum] = useState(false);
    const [posts, setPosts] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [blockCreate, setBlockCreate] = useState(false);
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if(id == userData._id) {
            setAvatar(`${serverUrl}/users/${userData._id}/avatar/${userData.avatar}`);
            setUsername(userData.username);
            setSex(userData?.sex != undefined ? userData.sex : '');
            setBirthday(userData?.birthday != undefined ? userData.birthday.split('T')[0] : '');
        }
        else {
            server('/getUser', { userId: id })
            .then(result => {
                if(result.error) navigate('/');
                else {
                    setAvatar(`${serverUrl}/users/${result.user._id}/avatar/${result.user.avatar}`);
                    setUsername(result.user.username);
                    setSex(result.user?.sex != undefined ? result.user.sex : '');
                    setBirthday(result.user?.birthday != undefined ? result.user.birthday.split('T')[0] : '');

                    if(result.user.friends.includes(userData._id)) setFriendStatus(3);
                    else if(result.user.friend_requests.includes(userData._id)) setFriendStatus(1);
                    else if(userData.friend_requests.includes(result.user._id)) setFriendStatus(2);
                }
            })
            .catch(e => navigate('/'));
        }

        server('/getAlbums', { userId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setAlbums(result.albums);
        })
        .catch(e => setError([true, 'Произошла ошибка']));
    }, [id])

    function getAge(date) {
        if(date == undefined || date == '') return '';

        let nowDate = new Date();
        let birthdayDate = new Date(date);
        let retDate = Math.trunc((nowDate - birthdayDate) / 31622400000);
        let lastNum = Number(String(retDate)[String(retDate).length - 1]);

        return retDate + (lastNum == 1 ? ' год' : (retDate > 9 && retDate < 21) ? ' лет' : (lastNum > 0 && lastNum < 4) ? ' года' : ' лет');
    }

    function editData() {
        serverFile('/changeUser', { userId: userData._id, username, sex, birthday, oldAvatar: userData.avatar }, [avatar])
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setUserData(prevState => { return { ...prevState, username, sex, birthday, avatar: result.avatar != undefined ? result.avatar : prevState.avatar } });
                setShowChange(false);
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function deleteUser() {
        server('/deleteUser', { userId: userData._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                localStorage.removeItem('token');
                window.location.reload();
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function reqFriend(req) {
        server(req, { userId: id, senderId: userData._id })
        .then(result => {
            if(!result.error) setFriendStatus(result.status);
            else setError([true, result.message]);
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function createAlbum() {
        server('/createAlbum', { userId: userData._id, name: albumName })
        .then(result => {
            if(!result.error) {
                setAlbums(prevState => [result.album, ...prevState]);
                setShowAddAlbum(false);
            }
            else setError([true, result.message]);
        })
        .catch(e => setError([true, 'Произошла ошибка']));
    }

    function deleteAlbum(id) {
        server('/deleteAlbum', { albumId: id, userId: userData._id })
        .then(result => {
            if(!result.error) setAlbums(prevState => prevState.filter(album => album._id != id));
            else setError([true, result.message]);
        })
        .catch(e => setError([true, 'Произошла ошибка']));
    }

    function createChat() {
        socket.emit('createChat', { type: 'personal', senderId: userData._id, userId: id });
        socket.on('createChat', result => {
            navigate(`/chat/${result.id}`);
            socket.off('createChat');
        })
    }

    useEffect(() => {
        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [search, id])

    useEffect(() => {
        if(fetching) {
            server('/getPosts', { userId: id, senderId: userData._id, type: 'user', search, count })
            .then(result => {
                if(!result.error) {
                    if(count != 0) setPosts([...posts, ...result.posts]);
                    else setPosts(result.posts);

                    setCount(prevState => prevState + 1);
                    setMaxCount(result.maxCount);
                    setFetching(false);
                }
            })
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(posts == null) return;

        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && posts.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, posts])

    function createPost() {
        setBlockCreate(true);

        serverFile('/createPost', { creator: userData._id, text, type: 'user' }, files)
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setShowCreatePost(false);
                setText('');
                setFiles([]);
                setPosts(prevState => [result.post, ...prevState]);
            }

            setBlockCreate(false);
        })
        .catch(e => {
            setError([true, 'Произошла ошибка']);
            setBlockCreate(false);
        })
    }

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch} />
            </div>
            
            {id == userData._id &&
            <div className='profile_userdata'>
                <img src={`${serverUrl}/users/${userData._id}/avatar/${userData.avatar}`} />

                <div className='profile_info'>
                    <div>{userData.username}{userData?.sex != undefined && userData.sex != '' ? ', ' + userData?.sex : ''}</div>
                    <div>{getAge(userData?.birthday)}</div>
                </div>

                <div className='profile_buttons'>
                    <Button title='Изменить' onClick={() => setShowChange(true)} />
                </div>
            </div>}

            {id != userData._id &&
            <div className='profile_userdata'>
                <img src={avatar} />

                <div className='profile_info'>
                    <div>{username}{sex != undefined && sex != '' ? ', ' + sex : ''}</div>
                    <div>{getAge(birthday)}</div>
                </div>

                <div className='profile_buttons'>
                    {friendStatus == 0 && <Button title='Добавить в друзья' onClick={() => reqFriend('/friendRequest')} />}
                    {friendStatus == 1 && <Button title='Приглашение отправлено' />}
                    {friendStatus == 2 && <Button title='Принять приглашение' onClick={() => reqFriend('/friendAccept')} />}
                    {friendStatus == 3 && <Button title='Удалить из друзей' onClick={() => setConfirm([true, reqFriend, ['/friendDelete']])} />}
                    <Button title='Написать' onClick={createChat} />
                </div>
            </div>}

            {albums != null &&
            <div className='profile_albums'>
                <div className='profile_albums_title'>
                    Альбомы
                    {id == userData._id && <img src='/images/plus.png' onClick={() => setShowAddAlbum(!showAddAlbum)} />}
                </div>

                {showAddAlbum &&
                <div className='profile_addAlbum'>
                    <Input value={albumName} setValue={setAlbumName} placeholder='Без названия' />
                    <Button title='Создать' onClick={createAlbum} />
                </div>}

                <div className='profile_albums_scroll'>
                    {albums.length != 0 && albums.map((album, i) =>
                        <div key={i} className='profile_album'>
                            {id == userData._id && <img className='profile_album_delete' src='/images/delete.png' onClick={() => setConfirm([true, deleteAlbum, [album._id]])} />}

                            <Link to={`/album/${album._id}`} className='profile_album_preview'>
                                {album.files.length != 0 && album.files[0].mimetype == 'image' &&
                                <img src={`${serverUrl}/users/${id}/albums/${album._id}/${album.files[0].src}`} />}
                            </Link>

                            <div className='proile_album_name'>{album.name}</div>
                        </div>
                    )}
                </div>
            </div>}

            <div className='profile_posts'>
                <div className='profile_posts_title'>
                    Посты
                    {id == userData._id && <img src='/images/plus.png' onClick={() => setShowCreatePost(true)} />}
                </div>
            </div>

            <div className='posts_wrapper'>
                {posts == null &&
                <div className='posts_noItems'>
                    <div className='posts_noItems_loading'></div>
                </div>}

                {posts != null && posts.length == 0 &&
                <div className='posts_noItems'>
                    <div className='posts_noItems_text'>Нет результатов</div>
                </div>}

                {posts != null && posts.length != 0 && posts.map((post, i) => <Post key={i} post={post} setPosts={setPosts} />)}
            </div>

            {showChange &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowChange(false)} />

                    <LoadAvatar value={`${serverUrl}/users/${userData._id}/avatar/${userData.avatar}`} setValue={setAvatar} />

                    <Input value={username} setValue={setUsername} placeholder='Имя пользователя' />

                    <Select
                        title='Выберите пол'
                        setValue={setSex}
                        value={sex}
                        options={[{ value: 'м', text: 'Мужской' }, { value: 'ж', text: 'Женский' }]}
                    />

                    <Datepicker value={birthday} setValue={setBirthday} />

                    <Button title='Сохранить' onClick={editData} />
                    <Button title='Удалить аккаунт' onClick={() => setConfirm([true, deleteUser, []])} />
                </div>
            </div>}

            {showCreatePost &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={() => setShowCreatePost(false)} />

                    <FilesInput setValue={setFiles} value={[]} />

                    <textarea value={text} onChange={e => setText(e.target.value)} />

                    <Button title='Создать' onClick={createPost} />

                    {blockCreate && <div className='dataform_block'></div>}
                </div>
            </div>}
        </div>
    )
}