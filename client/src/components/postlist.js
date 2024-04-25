//const { useState, useEffect } = require('react');
const { server } = require('../server');
const serverUrl = require('../server_url');

const Post = require('./post').default;

export default function PostList(props) {
    const { posts, setPosts, userID, setConfirm, setError, setEdit, setShowAddPost, setEditedPost } = props;

    function deletePost(id) {
        server('/post/deletePost', { id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setPosts(posts.filter(post => post._id != result.id));
        })
    }

    function editPost(post) {
        let item = { _id: post._id, text: post.text, files: post?.files != undefined ? post.files.map(item => { return { type: item.type.split('/')[0], src: `${serverUrl}/posts/${post._id}/${item._id}.${item.type.split('/')[1]}` } }) : []};
        setEdit(true);
        setShowAddPost(true);
        setEditedPost(item);
    }

    if(posts == null) {
        return(
            <div className='load_wrapper'>
                <div className='load_div'></div>
            </div>
        )
    }
    else if(posts.length == 0) {
        return(
            <div className='main_posts_wrapper'>
                <div className='posts_noResults'>
                    Нет результатов
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='main_posts_wrapper'>
                {posts.map((item, i) =>
                    <Post
                        key={i}
                        item={item}
                        userID={userID}
                        setConfirm={setConfirm}
                        deletePost={deletePost}
                        editPost={editPost}
                        setError={setError}
                    />)}
            </div>
        )
    }
}