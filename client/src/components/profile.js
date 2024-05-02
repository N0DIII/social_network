const { useEffect, useState, useCallback } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const serverUrl = require('../server_url.js');
const { server } = require('../server.js');

require('../styles/profile.css');

const Button = require('./button.js').default;
const Input = require('./input.js').default;
const Albumlist = require('./albumlist.js').default;
const PostList = require('./postlist').default;
const Search = require('./search').default;
const AddPost = require('./add_post').default;
const ChangeUserData = require('./change_userdata.js').default;

export default function Profile(props) {
    const { userData, setError, socket, setConfirm, isMobile } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [user, setUser] = useState(null);
    const [albums, setAlbums] = useState(null);
    const [showAddAlbum, setShowAddAlbum] = useState(false);
    const [albumName, setAlbumName] = useState('');
    const [friendStatus, setFriendStatus] = useState(0);
    const [showChange, setShowChange] = useState(false);
    
    const [search, setSearch] = useState('');
    const [showAddPost, setShowAddPost] = useState(false);
    const [posts, setPosts] = useState(null);
    const [edit, setEdit] = useState(false);
    const [editedPost, setEditedPost] = useState({});

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        server('/user/getUserData', { id: id, myId: userData._id })
        .then(result => {
            if(!result.error) {
                setUser(result.user);
                setFriendStatus(result.friendStatus);
            }
            else navigate('/not_found');
        })

        server('/album/getAlbums', { id: id })
        .then(result => {
            if(!result.error) setAlbums(result.albums);
            else setError([true, result.message]);
        })
    }, [userData, id])

    useEffect(() => {
        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [search, id])

    useEffect(() => {
        if(fetching) {
            server('/post/getPosts', { user: userData._id, count, search, filter: ['user', id] })
            .then(result => {
                if(result.error) {
                    setError([true, result.message]);
                    return;
                }
                
                if(count != 0) setPosts([...posts, ...result.posts]);
                else setPosts(result.posts);

                setCount(prevState => prevState + 1);
                setMaxCount(result.maxCount);
            })

            setFetching(false);
        }
    }, [fetching])

    const scroll = useCallback(e => {
        if(e.target.scrollHeight - (Math.abs(e.target.scrollTop) + window.innerHeight) < 100 && posts.length < maxCount) {
            setFetching(true);
        }
    }, [maxCount, posts])

    function getAge(date) {
        let nowDate = new Date();
        let birthdayDate = new Date(date);
        let retDate = Math.trunc((nowDate - birthdayDate) / 31622400000);
        let lastNum = Number(String(retDate)[String(retDate).length - 1]);

        return retDate + (lastNum > 0 && lastNum < 4 ? ' года' : ' лет');
    }

    function reqFriend(req) {
        server(req, {id: id, myId: userData._id})
        .then(result => {
            if(!result.error) setFriendStatus(result.status);
            else setError([true, result.message]);
        })
    }

    function addAlbum() {
        server('/album/addAlbum', { id: id, name: albumName })
        .then(result => {
            if(!result.error) {
                setAlbums([...albums, result.album]);
                setShowAddAlbum(false);
            }
            else setError([true, result.message]);
        })
    }

    function deleteAlbum(id) {
        server('/album/deleteAlbum', { album: id, user: userData._id })
        .then(result => {
            if(!result.error) setAlbums(albums.filter(album => album._id != id));
            else setError([true, result.message]);
        })
    }

    function createChat() {
        socket.emit('createPersonalChat', { user1: userData._id, user2: id });
        socket.on('createPersonalChat', id => {
            navigate(`/chat/${id}`);
        })
    }

    function signOut() {
        localStorage.setItem('token', '');
        window.location.assign('/login');
    }

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch}/>
            </div>

            <div className='profile_userdata'>
                <img className='profile_avatar' src={`${serverUrl}/users/${id}/avatar.png`}/>

                <div className='profile_userdata_info'>
                    <div className='profile_userdata_username'>{user?.username}{user?.sex != undefined ? `, ${user.sex}` : ''}</div>
                    {user?.birthday != undefined && <div className='profile_userdata_birthday'>{getAge(user.birthday)}</div>}
                </div>

                {userData._id != id &&
                <div className='profile_userdata_buttons'>
                    {friendStatus == 0 && <Button title='Добавить в друзья' onclick={() => reqFriend('/user/addFriend')}/>}
                    {friendStatus == 1 && <Button title='Приглашение отправлено'/>}
                    {friendStatus == 2 && <Button title='Принять приглашение' onclick={() => reqFriend('/user/acceptFriend')}/>}
                    {friendStatus == 3 && <Button title='Удалить из друзей' onclick={() => setConfirm([true, reqFriend, ['/user/deleteFriend']])}/>}
                    <Button title='Написать' onclick={createChat}/>
                </div>}

                {userData._id == id &&
                <div className='profile_userdata_buttons'>
                    <Button title='Изменить' onclick={() => setShowChange(true)}/>
                    {isMobile && <Button title='Выйти' onclick={signOut}/>}
                </div>}
            </div>

            {showChange &&
            <ChangeUserData
                close={() => setShowChange(false)}
                userData={userData}
                setError={setError}
                setConfirm={setConfirm}
            />}

            <div className='profile_albums_wrapper'>
                <div className='profile_albums_title'>
                    Альбомы
                    {userData._id == id && <img className='profile_albums_addAlbumButton' src={!showAddAlbum ? '/images/plus.png' : '/images/cross.png'} onClick={() => setShowAddAlbum(!showAddAlbum)}/>}
                </div>

                {showAddAlbum && 
                <div className='profile_albums_addAlbum'>
                    <Input type='text' placeholder='Без названия' setValue={setAlbumName}/>
                    <Button title='Сохранить' onclick={addAlbum}/>
                </div>}

                <Albumlist items={albums} isOwner={userData._id == id ? true : false} deleteAlbum={deleteAlbum} setConfirm={setConfirm}/>
            </div>

            {showAddPost &&
            <AddPost
                close={() => {setShowAddPost(false); setEdit(false)}}
                user={userData._id}
                setError={setError}
                edit={edit}
                post={editedPost}
                type='user'
            />}

            <div className='profile_posts_title'>
                Посты
                {userData._id == id && <img className='profile_addPost' src='/images/plus.png' title='Написать пост' onClick={() => setShowAddPost(true)}/>}
            </div>
            <PostList
                posts={posts}
                setPosts={setPosts}
                userID={userData._id}
                setConfirm={setConfirm}
                setError={setError}
                setEdit={setEdit}
                setShowAddPost={setShowAddPost}
                setEditedPost={setEditedPost}
            />
        </div>
    )
}