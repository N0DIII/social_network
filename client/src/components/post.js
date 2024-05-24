const { useState, useEffect } = require('react');
const { Link } = require('react-router-dom');
const { server } = require('../server');
const serverUrl = require('../server_url');

require('../styles/post.css');

const FullscreenImage = require('./fullscreen_image').default;
const Comments = require('./comments').default;

export default function Post(props) {
    const { item, userID, setConfirm, deletePost, editPost, setError } = props;

    const [files, setFiles] = useState([]);
    const [selectFile, setSelectFile] = useState({ type: 'await' });
    const [avatar, setAvatar] = useState('');
    const [creatorLink, setCreatorLink] = useState('');
    const [selectImage, setSelectImage] = useState('');
    const [show, setShow] = useState(false);
    const [textShow, setTextShow] = useState(false);
    const [like, setLike] = useState(item.like);
    const [likeCount, setLikeCount] = useState(item.likeCount);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(item.commentCount);

    useEffect(() => {
        if(item?.user != undefined) {
            setAvatar(`${serverUrl}/users/${item.creator._id}/avatar_${item.creator.avatar}.png`);
            setCreatorLink(`/profile/${item.user}`);
        }
        else if(item?.group != undefined) {
            setAvatar(`${serverUrl}/groups/${item.creator._id}/avatar_${item.creator.avatar}.png`);
            setCreatorLink(`/group/${item.group}`);
        }

        if(item.type == 'text') return;

        let updFiles = [];
        item.files.forEach(file => {
            updFiles.push({ type: file.type.split('/')[0] == 'image' ? 'image' : 'video', src: `/posts/${item._id}/${file._id}.${file.type.split('/')[1]}` });
        })

        setFiles(updFiles);
        setSelectFile({ ...updFiles[0], index: 0 });
    }, [item])

    function changeFile(i, dest) {
        setSelectFile({ type: files[i + dest].type, src: files[i + dest].src, index: i + dest});
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

    function likePost() {
        if(!like) {
            server('/post/addLike', { user: userID, post: item._id })
            .then(result => {setLike(true); setLikeCount(prevState => prevState + 1)})
        }
        else {
            server('/post/deleteLike', { user: userID, post: item._id })
            .then(result => {setLike(false); setLikeCount(prevState => prevState - 1)})
        }
    }

    function numberRound(num) {
        if(num < 1000) return num;
        else if(num < 1000000) return Number(Math.trunc(num / 1000)) + 'k';
        else return Number(Math.trunc(num / 1000000)) + 'M';
    }

    return(
        <div className='post_wrapper'>
            <div className='post_header'>
                <Link className='post_header_creatorLink' to={creatorLink}>
                    <img className='post_header_avatar' src={avatar}/>
                    <div className='post_header_name'>{item.creator.name}</div>
                </Link>
                <div className='post_header_created'>{item?.edit != undefined ? 'изм.' : ''} {created(item.created)}</div>
                {(item?.user == userID || (item.creator?.admins != undefined && item.creator.admins.includes(userID))) &&
                <div className='post_header_creator'>
                    <img src='/images/pen.png' title='Изменить' onClick={() => editPost(item)}/>
                    <img src='/images/delete.png' title='Удалить' onClick={() => setConfirm([true, deletePost, [item._id]])}/>
                </div>}
            </div>

            {item.type == 'file' &&
            <div className='post_files'>
                {selectFile.index != 0 && <img className='post_files_button post_previous' src='/images/leftArrow.png' onClick={() => changeFile(selectFile.index, -1)}/>}
                {selectFile.type == 'image' && <img className='post_image' src={`${serverUrl}${selectFile.src}`} onClick={() => {setSelectImage({ type: selectFile.type, src: selectFile.src }); setShow(true)}}/>}
                {selectFile.type == 'video' &&
                <div className='post_video_div'>
                    <img src='/images/play.png'/>
                    <video className='post_video' src={`${serverUrl}${selectFile.src}`} onClick={() => {setSelectImage({ type: selectFile.type, src: selectFile.src }); setShow(true)}}/>
                </div>}
                {selectFile.index < files.length - 1 && <img className='post_files_button post_next' src='/images/rightArrow.png' onClick={() => changeFile(selectFile.index, 1)}/>}
            </div>}

            {!textShow &&
            <div className='post_text'>
                {item.text.split('\n').length == 1 && item.text.length > 100 ? item.text.slice(0, 100) : item.text.split('\n')[0]}
                {(item.text.split('\n').length > 1 || item.text.length > 100) && <div className='post_text_showAll' onClick={() => setTextShow(true)}>Показать полностью<img src='/images/arrowDown.png'/></div>}
            </div>}

            {textShow &&
            <div className='post_text'>
                {item.text}
                <div className='post_text_showAll' onClick={() => setTextShow(false)}>Скрыть<img src='/images/arrowDown.png' style={{ transform: 'rotate(180deg)' }}/></div>
            </div>}

            <div className='post_footer'>
                <div className='post_footer_button_wrapper'>
                    <div className={!like ? 'post_footer_like' : 'post_footer_liked'} title={!like ? 'Понравилось' : 'Удалить отметку'} onClick={likePost}></div>
                    <div className='post_footer_likeCount'>{numberRound(likeCount)}</div>
                </div>
                <div className='post_footer_button_wrapper'>
                    <div className='post_footer_comments' title='Комментарии' onClick={() => setShowComments(!showComments)}></div>
                    <div className='post_footer_commentCount'>{numberRound(commentCount)}</div>
                </div>
            </div>

            {showComments &&
            <Comments
                user={userID}
                post={item._id}
                setCount={setCommentCount}
                setError={setError}
                setConfirm={setConfirm}
                count={setCommentCount}
            />}

            {show && <FullscreenImage selectImage={selectImage} images={files} setShow={setShow} index={selectFile.index}/>}
        </div>
    )
}