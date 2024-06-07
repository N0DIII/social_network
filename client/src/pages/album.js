import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router';

import { server, serverFile } from '../server';
import serverUrl from '../server_url';

import { Context } from '../components/context';
import RightMenu from './right_menu';
import LeftMenu from './left_menu';

export default function Album() {
    const { userData, setError, setSuccess, setConfirm, setFFiles, setSFFile, setFParams } = useContext(Context);
    const params = useParams();
    const { id } = params;

    const title = useRef(null);
    const [name, setName] = useState('');
    const [user, setUser] = useState('');
    const [files, setFiles] = useState(null);
    const [changeName, setChangeName] = useState(false);

    useEffect(() => {
        server('/getAlbum', { albumId: id })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                setName(result.album.name);
                setUser(result.album.user);
                setFiles(result.album.files);
                setFFiles(result.album.files);
            }
        })
        .catch(e => setError([true, 'Произошла ошибка']));
    }, [id])

    function changeAlbum() {
        if(!changeName) {
            setChangeName(true);
            title.current.disabled = false;
            title.current.focus();
        }
        else {
            server('/changeAlbum', { albumId: id, name })
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    setChangeName(false);
                    title.current.disabled = true;
                    setSuccess([true, 'Название успешно изменено']);
                }
            })
            .catch(e => setError([true, 'Произошла ошибка']));
        }
    }

    function loadFile(e) {
        if(e.target.files[0]) {
            serverFile('/loadAlbumFile', { albumId: id, userId: userData._id }, [e.target.files[0]])
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    setFiles(prevState => [...result.files, ...prevState]);
                    setFFiles(prevState => [...result.files, ...prevState]);
                }
            })
            .catch(e => setError([true, 'Произошла ошибка']));
        }
    }

    function deleteFile(src) {
        server('/deleteAlbumFile', { userId: userData._id, albumId: id, src })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else setFiles(prevState => prevState.filter(file => file.src != src));
        })
        .catch(e => setError([true, 'Произошла ошибка']))
    }

    function selectFile(file) {
        setFParams({ show: true, link: `${serverUrl}/users/${user}/albums/${id}/` });
        setSFFile(file);
    }

    return(
        <div className='page'>
            {user == userData._id &&
            <div className='page_title'>
                <input ref={title} className='album_name' type='text' value={name} onChange={e => setName(e.target.value)} disabled placeholder='Без названия' />
                <img src={changeName ? '/images/checkMark.png' : '/images/pen.png'} onClick={changeAlbum} />
                <div className='album_button'>
                    <input type='file' accept='image/*, video/*' onChange={loadFile} />
                    <img src='/images/plus.png' />
                </div>
            </div>}

            {user != userData._id &&
            <div className='page_title'>
                <div className='album_name'>{name}</div>
            </div>}

            <RightMenu />
            <LeftMenu />

            <div className='album_wrapper'>
                {files != null && files.length != 0 && files.map((file, i) =>
                    <div key={i} className='album_file'>
                        {file.mimetype == 'image' && <img className='album_image' src={`${serverUrl}/users/${user}/albums/${id}/${file.src}`} onClick={() => selectFile(file)} />}
                        {file.mimetype == 'video' &&
                        <div className='album_video' onClick={() => selectFile(file)}>
                            <video className='album_image' src={`${serverUrl}/users/${user}/albums/${id}/${file.src}`} />
                            <img src='/images/play.png' />
                        </div>}
                        {user == userData._id && <img className='album_delete' src='/images/delete.png' onClick={() => setConfirm([true, deleteFile, [file.src]])} />}
                    </div>
                )}
            </div>
        </div>
    )
}