import { useState, useContext, useEffect, useCallback } from 'react';

import { server } from '../server';

import { Context } from '../components/context';
import Search from '../components/search';
import Post from '../components/post';

export default function Posts() {
    const { userData } = useContext(Context);

    const [search, setSearch] = useState('');
    const [posts, setPosts] = useState(null);

    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(1);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        setCount(0);
        setMaxCount(1);
        setPosts(null);
        setFetching(true);
    }, [search])

    useEffect(() => {
        if(fetching) {
            server('/getPosts', { senderId: userData._id, type: '', search, count })
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

    return(
        <div className='page' onScroll={scroll} onResize={scroll}>
            <div className='page_title'>
                <Search setValue={setSearch} />
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
        </div>
    )
}