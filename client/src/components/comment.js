import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import serverUrl from '../server_url';

import { Context } from './context';

export default function Comment(props) {
    const { userData, setFFiles, setSFFile, setFParams, setConfirm } = useContext(Context);
    const { comment, postId, changeComment, deleteComment } = props;

    const [files, setFiles] = useState([]);
    const [apps, setApps] = useState([]);
    const [select, setSelect] = useState(0);

    useEffect(() => {
        setFiles([]);
        setApps([]);

        comment.files.forEach(file => {
            if(file.mimetype == 'application') setApps(prevState => [...prevState, { src: `${serverUrl}/posts/${postId}/comments/${comment._id}/${file.src}`, mimetype: file.mimetype, name: file.originalname }]);
            else setFiles(prevState => [...prevState, { src: `${serverUrl}/posts/${postId}/comments/${comment._id}/${file.src}`, mimetype: file.mimetype }]);
        })
    }, [comment])

    function created(str) {
        const date = new Date(str);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${day < 10 ? '0' + day : day}.${month < 9 ? '0' + Number(month + 1) : Number(month + 1)}.${year} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
    }

    function selectFile(file) {
        setFFiles(files);
        setFParams({ show: true, link: '' });
        setSFFile(file);
    }

    return(
        <div className='comment_wrapper'>
            <div className='comment_header'>
                <Link to={`/profile/${comment.user}`} className='comment_user'>
                    <img src={`${serverUrl}/users/${comment.user}/avatar/${comment.creator.avatar}`} />
                    <div>{comment.creator.username}</div>
                </Link>

                <div className='comment_created'>
                    {comment?.edit != undefined && comment.edit ? 'изм. ' : ''}
                    {created(comment.created)}

                    {comment.user == userData._id &&
                    <div className='comment_buttons'>
                        <img src='/images/pen.png' title='Изменить комментарий' onClick={() => changeComment([...files, ...apps], comment.text, comment._id)} />
                        <img src='/images/delete.png' title='Удалить комментарий' onClick={() => setConfirm([true, deleteComment, [comment._id]])} />
                    </div>}
                </div>
            </div>
            
            <div className='comment_main'>
                {files.length != 0 &&
                <div className='comment_files'>
                    {files[select].mimetype == 'image' && <img className='comment_files_image' src={files[select].src} onClick={() => selectFile(files[select])} />}
                    {files[select].mimetype == 'video' &&
                    <div className='comment_files_video' onClick={() => selectFile(files[select])}>
                        <video src={files[select].src} />
                        <img src='/images/play.png' />
                    </div>}

                    {select > 0 && <img className='comment_files_prev' src='/images/leftArrow.png' onClick={() => setSelect(prevState => prevState - 1)} />}
                    {select < files.length - 1 && <img className='comment_files_next' src='/images/rightArrow.png' onClick={() => setSelect(prevState => prevState + 1)} />}
                </div>}

                {apps.length != 0 &&
                <div className='comment_apps'>
                    {apps.map((file, i) =>
                        <div key={i} className='comment_app'>
                            <img src='/images/file.png' />
                            <a href={file.src}>{file.name}</a>
                        </div>
                    )}
                </div>}

                {comment.text != '' && <div className='comment_text'>{comment.text}</div>}
            </div>
        </div>
    )
}