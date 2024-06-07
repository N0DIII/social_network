import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from './context';
import Button from '../components/button';
import FilesInput from '../components/input_files';
import Comment from '../components/comment';

export default function Post(props) {
    const { setError, setConfirm, setFFiles, setSFFile, setFParams, userData } = useContext(Context);
    const { post, setPosts } = props;

    const [files, setFiles] = useState([]);
    const [apps, setApps] = useState([]);
    const [select, setSelect] = useState(0);
    const [textShow, setTextShow] = useState(false);
    const [showChange, setShowChange] = useState(false);
    const [text, setText] = useState(post.text);
    const [newFiles, setNewFiles] = useState([]);
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [like, setLike] = useState(post.like);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [commCount, setCommCount] = useState(post.commentCount);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commFiles, setCommFiles] = useState([]);
    const [commNewFiles, setCommNewFiles] = useState([]);
    const [commDeletedFiles, setCommDeletedFiles] = useState([]);
    const [isEditComm, setIsEditComm] = useState([false]);
    const [showFiles, setShowFiles] = useState(false);

    useEffect(() => {
        setFiles([]);
        setApps([]);

        post.files.forEach(file => {
            if(file.mimetype == 'application') setApps(prevState => [...prevState, { src: `${serverUrl}/posts/${post._id}/${file.src}`, mimetype: file.mimetype, name: file.src }]);
            else setFiles(prevState => [...prevState, { src: `${serverUrl}/posts/${post._id}/${file.src}`, mimetype: file.mimetype }]);
        })
    }, [post])

    function close() {
        setDeletedFiles([]);
        setNewFiles([]);
        setShowChange(false);
    }

    function created(str) {
        const date = new Date(str);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${day < 10 ? '0' + day : day}.${month < 9 ? '0' + Number(month + 1) : Number(month + 1)}.${year} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
    }

    function changePost() {
        serverFile('/changePost', { postId: post._id, text, deletedFiles }, newFiles)
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                close();
                setPosts(prevState => prevState.map(item => {
                    if(item._id == post._id) return result.post;
                    else return item;
                }))
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function deletePost() {
        server('/deletePost', { postId: post._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setPosts(prevState => prevState.filter(item => item._id != post._id));
        })
    }

    function selectFile(file) {
        setFFiles(files);
        setFParams({ show: true, link: '' });
        setSFFile(file);
    }

    function numberRound(num) {
        if(num < 1000) return num;
        else if(num < 1000000) return Number(Math.trunc(num / 1000)) + 'k';
        else return Number(Math.trunc(num / 1000000)) + 'M';
    }

    function likePost() {
        if(!like) server('/likePost', { postId: post._id, senderId: userData._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setLike(true);
                setLikeCount(prevState => prevState + 1);
            }
        })
        else server('/unlikePost', { postId: post._id, senderId: userData._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setLike(false);
                setLikeCount(prevState => prevState - 1);
            }
        })
    }

    function changeFiles() {
        setShowFiles(!showFiles);
        setCommNewFiles([]);
    }

    function cancelChange() {
        setNewComment('');
        setShowFiles(false);
        setCommDeletedFiles([]);
        setIsEditComm([false]);
    }

    function sendComment() {
        if(newComment.trim() == '' && commNewFiles.length == 0) return;

        if(!isEditComm[0]) {
            serverFile('/createComment', { senderId: userData._id, postId: post._id, text: newComment }, commNewFiles)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    setComments(prevState => [...prevState, result.comment]);
                    setNewComment('');
                    setShowFiles(false);
                    setCommNewFiles([]);
                    setCommCount(prevState => prevState + 1);
                }
            })
        }
        else {
            serverFile('/changeComment', { commentId: isEditComm[1], postId: post._id, text: newComment, deletedFiles: commDeletedFiles }, commNewFiles)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    setComments(prevState => prevState.map(item => {
                        if(item._id == result.comment._id) return result.comment;
                        else return item;
                    }))
                    setCommNewFiles([]);
                    cancelChange();
                }
            })
        }
    }

    function openComments() {
        server('/getComments', { postId: post._id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setComments(result.comments);
        })

        setShowComments(true);
    }

    function closeComments() {
        setComments([]);
        setShowComments(false);
    }

    function changeComment(files, text, commentId) {
        setIsEditComm([true, commentId]);
        setNewComment(text);

        if(files.length != 0) {
            setCommFiles(files);
            setShowFiles(true);
        }
    }

    function deleteComment(commentId) {
        server('/deleteComment', { postId: post._id, commentId })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setComments(prevState => prevState.filter(item => item._id != commentId));
                setCommCount(prevState => prevState - 1);
            }
        })
    }

    return(
        <div className='post_wrapper'>
            <div className='post_header'>
                {post.type == 'user' &&
                <Link to={`/profile/${post.creator._id}`} className='post_creator'>
                    <img src={`${serverUrl}/users/${post.creator._id}/avatar/${post.creator.avatar}`} />
                    <div>{post.creator.name}</div>
                </Link>}

                {post.type == 'group' &&
                <Link to={`/group/${post.creator._id}`} className='post_creator'>
                    <img src={`${serverUrl}/groups/${post.creator._id}/avatar/${post.creator.avatar}`} />
                    <div>{post.creator.name}</div>
                </Link>}

                <div className='post_created'>
                    {post.edit ? 'изм. ' : ''}
                    {created(post.created)}

                    {post.creator.creator &&
                    <div className='post_buttons'>
                        <img src='/images/pen.png' title='Изменить' onClick={() => setShowChange(true)} />
                        <img src='/images/delete.png' title='Удалить' onClick={() => setConfirm([true, deletePost, []])} />
                    </div>}
                </div>
            </div>

            <div className='post_main'>
                <div className='post_files'>
                    {files.length != 0 &&
                    <div className='post_images'>
                        {select > 0 && <img className='post_images_prev' src='/images/leftArrow.png' onClick={() => setSelect(prevState => prevState - 1)} />}
                        {select < files.length - 1 && <img className='post_images_next' src='/images/rightArrow.png' onClick={() => setSelect(prevState => prevState + 1)} />}

                        {files[select].mimetype == 'image' && <img className='post_images_image' src={files[select].src} onClick={() => selectFile(files[select])} />}
                        {files[select].mimetype == 'video' &&
                        <div className='post_images_video' onClick={() => selectFile(files[select])}>
                            <video src={files[select].src} />
                            <img src='/images/play.png' />
                        </div>}
                    </div>}

                    {apps.length != 0 &&
                    <div className='post_apps'>
                        {apps.length != 0 && apps.map((file, i) =>
                            <div key={i} className='post_app'>
                                <img src='/images/file.png' />
                                <a href={file.src}>{file.name}</a>
                            </div>
                        )}
                    </div>}
                </div>

                {!textShow &&
                <div className='post_text'>
                    {post.text.split('\n').length == 1 && post.text.length > 100 ? post.text.slice(0, 100) : post.text.split('\n')[0]}
                    {(post.text.split('\n').length > 1 || post.text.length > 100) && <div className='post_text_showAll' onClick={() => setTextShow(true)}>Показать полностью<img src='/images/arrowDown.png'/></div>}
                </div>}

                {textShow &&
                <div className='post_text'>
                    {post.text}
                    <div className='post_text_showAll' onClick={() => setTextShow(false)}>Скрыть<img src='/images/arrowDown.png' style={{ transform: 'rotate(180deg)' }}/></div>
                </div>}
            </div>

            <div className='post_footer'>
                <div className='post_footer_button_wrapper'>
                    <div className={!like ? 'post_footer_like' : 'post_footer_liked'} title={!like ? 'Понравилось' : 'Удалить отметку'} onClick={likePost}></div>
                    <div className='post_footer_likeCount'>{numberRound(likeCount)}</div>
                </div>
                <div className='post_footer_button_wrapper'>
                    <div className='post_footer_comments' title='Комментарии' onClick={openComments}></div>
                    <div className='post_footer_commentCount'>{numberRound(commCount)}</div>
                </div>
            </div>

            {showChange &&
            <div className='dataform_wrapper'>
                <div className='dataform'>
                    <img className='dataform_close' src='/images/cross.png' onClick={close} />

                    <FilesInput setValue={setNewFiles} value={[...files, ...apps]} setDeletedValue={setDeletedFiles} />

                    <textarea value={text} onChange={e => setText(e.target.value)} />

                    <Button title='Изменить' onClick={changePost} />
                </div>
            </div>}

            {showComments &&
            <div className='dataform_wrapper' style={{ padding: '5vh 0' }}>
                <div className='dataform comments_wrapper'>
                    <img className='dataform_close' src='/images/cross.png' onClick={closeComments} />

                    <div className='comments'>
                        {comments.length == 0 &&
                        <div className='noComments_wrapper'>
                            <div className='noComments'>Нет комментариев</div>
                        </div>}

                        {comments.length != 0 && comments.map((comment, i) =>
                            <Comment
                                key={i}
                                comment={comment}
                                postId={post._id}
                                changeComment={changeComment}
                                deleteComment={deleteComment}
                            />
                        )}
                    </div>

                    <div className='newMessage_wrapper' style={{ padding: '0', position: 'fixed' }}>
                        <img src='/images/clip.png' title='Прикрепить файл' onClick={changeFiles} />
                        <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder='Новый комментарий' />
                        {isEditComm[0] && <img src='/images/cross.png' title='Отменить изменение' onClick={cancelChange} />}
                        <img src='/images/send.png' title={!isEditComm[0] ? 'Отправить комментарий' : 'Изменить комментарий'} onClick={sendComment} />

                        {showFiles &&
                        <div className='newMessage_files' style={{ padding: '0' }}>
                            <FilesInput setValue={setCommNewFiles} value={commFiles} setDeletedValue={setCommDeletedFiles} />
                        </div>}
                    </div>
                </div>
            </div>}
        </div>
    )
}
