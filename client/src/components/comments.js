const { useState, useEffect } = require('react');
const { Link } = require('react-router-dom');
const { server, serverFile } = require('../server');
const serverUrl = require('../server_url');

require('../styles/comments.css');

const NewMessage = require('./new_message').default;
const FullscreenImage = require('./fullscreen_image').default;

export default function Comments(props) {
    const { user, post, setCount, setError, setConfirm, count } = props;

    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [selectImage, setSelectImage] = useState({});
    const [edit, setEdit] = useState(false);
    const [editedComment, setEditedComment] = useState();

    useEffect(() => {
        server('/post/getComments', { post }).then(result => setComments(result))
    }, [])

    function getDate(str) {
        const date = new Date(str);

        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();

        return `${day < 10 ? '0' + day : day}.${month < 9 ? '0' + Number(month + 1) : month + 1}.${year} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
    }

    function sendComment() {
        if(newComment.trim() == '') return;

        if(!edit) {
            server('/post/sendComment', { user, post, text: newComment })
            .then(result => {
                setNewComment('');
                server('/post/getComments', { post }).then(result => setComments(result));
                setCount(result);
            })
        }
        else {
            server('/post/editComment', { id: editedComment, text: newComment })
            .then(result => {
                setNewComment('');
                setEdit(false);
                server('/post/getComments', { post }).then(result => setComments(result));
            })
        }
    }

    function sendFile(e, close, url) {
        close(false);

        if(e.target.files && e.target.files[0]) {
            serverFile('/post/' + url, { user, post }, [e.target.files[0]])
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    server('/post/getComments', { post }).then(result => setComments(result))
                    setCount(result);
                }
            })
        }
    }

    function selectImg(item, type) {
        setShowFullscreen(true);
        setSelectImage({ type, src: `/posts/${post}/comments/${item._id}.${item.mimetype.split('/')[1]}`});
    }

    function deleteComment(item) {
        server('/post/deleteComment', { id: item._id, post, type: item.type, filename: item.type != 'text' ? `${item._id}.${item.mimetype.split('/')[1]}` : '' })
        .then(result => {
            if(!result.error) {
                server('/post/getComments', { post }).then(result => setComments(result));
                count(prevState => prevState - 1);
            }
            else setError([true, result.message])
        })
    }

    function editComment(item) {
        setEdit(true);
        setEditedComment(item._id);
        setNewComment(item.text);
    }

    return(
        <div>
            <div className='comments_wrapper'>
                {comments == null && <div className='load_wrapper'><div className='load_div'></div></div>}
                {comments != null && comments.length == 0 && <div className='comments_noComments'>Нет комментариев</div>}
                {comments != null && comments.length != 0 && comments.map((item, i) =>
                    <div key={i} className='comment_wrapper'>
                        <div className='comment_header'>
                            <Link className='comment_header_userdata' to={`/profile/${item.user._id}`}>
                                <img className='comment_header_avatar' src={`${serverUrl}/users/${item.user._id}/avatar.png`}/>
                                <div className='comment_header_username'>{item.user.username}</div>
                            </Link>
                            <div className='comment_header_created'>{item?.edit ? 'изм. ' : ''}{getDate(item.created)}</div>
                            {user == item.user._id &&
                            <div className='comment_creator'>
                                {item.type == 'text' && <img src='/images/pen.png' onClick={() => editComment(item)}/>}
                                <img src='/images/delete.png' onClick={() => setConfirm([true, deleteComment, [item]])}/>
                            </div>}
                        </div>
                        {item.type == 'text' && <div className='comment_text'>{item.text}</div>}
                        {item.type == 'image' &&
                        <img className='comment_image' src={`${serverUrl}/posts/${post}/comments/${item._id}.${item.mimetype.split('/')[1]}`} onClick={() => selectImg(item, 'image')}/>}
                        {item.type == 'video' &&
                        <div className='comment_video'>
                            <img src='/images/play.png'/>
                            <video src={`${serverUrl}/posts/${post}/comments/${item._id}.${item.mimetype.split('/')[1]}`} onClick={() => selectImg(item, 'video')}/>
                        </div>}
                        {item.type == 'file' &&
                        <a className='comment_file' href={`${serverUrl}/posts/${post}/comments/${item._id}.${item.mimetype.split('/')[1]}`}>
                            <img src='/images/file.png'/>
                            {item.filename}
                        </a>}
                    </div>
                )}
            </div>

            <div className='newComment_wrapper'>
                <NewMessage placeholder='Написать комментарий' value={newComment} setValue={setNewComment} sendMessage={sendComment} sendFile={sendFile} isEdit={edit}/>
            </div>

            {showFullscreen && <FullscreenImage setShow={setShowFullscreen} selectImage={selectImage} images={[selectImage]}/>}
        </div>
    )
}