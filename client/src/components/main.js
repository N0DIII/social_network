const { useEffect, useState, useCallback } = require('react');
const { useNavigate } = require('react-router-dom');
const { server } = require('../server');

require('../styles/main.css');

const Search = require('./search').default;
const AddPost = require('./add_post').default;
const PostList = require('./postlist').default;

export default function Main(props) {
    const { userData, setError, setConfirm } = props;
    const navigate = useNavigate();

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

        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [userData, search])

    useEffect(() => {
        if(fetching) {
            server('/post/getPosts', { user: userData._id, count, search, filter: [''] })
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

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch}/>
                <img className='main_addPost' src='/images/plus.png' title='Написать пост' onClick={() => setShowAddPost(true)}/>
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