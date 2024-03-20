const { useEffect, useState } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const serverUrl = require('../server_url.js');
const server = require('../server.js');

require('../styles/album.css');

const editImg = require('../images/pen.png');
const saveImg = require('../images/checkMark.png');
const deleteImg = require('../images/delete.png');

const RightMenu = require('./right_menu.js').default;
const LeftMenu = require('./left_menu.js').default;
const FullscreenImage = require('./fullscreen_image.js').default;

export default function Album(props) {
    const { userData } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [userID, setUserID] = useState();
    const [title, setTitle] = useState('');
    const [photos, setPhotos] = useState([]);

    const [titleDisabled, setTitleDisabled] = useState(true);
    const [showFullscreenImage, setShowFullscreenImage] = useState(false);
    const [selectImage, setSelectImage] = useState();

    const [update, setUpdate] = useState(0);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');

        server('/file/getAlbum', { id })
        .then(result => {
            if(!result) return navigate(`/profile/${userData._id}`);

            setTitle(result.album.name);
            setUserID(result.album.userID);
            setPhotos(result.photos);
        })

        window.addEventListener('keydown', e => {
            if(e.key == 'Escape') setShowFullscreenImage(false);
        })
    }, [userData, update])

    function loadPhoto(e) {
        if(e.target.files && e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = el => {
                server('/file/loadPhoto', { albumID: id, userID: userData._id, data: el.target.result })
                .then(result => {
                    if(result) {
                        setUpdate(update + 1);
                        e.target.value = null;
                    }
                })
            }

            reader.readAsDataURL(e.target.files[0]);
        }
    }

    function changeName(e) {
        if(titleDisabled) {
            e.target.src = saveImg;
            setTitleDisabled(false);
        }
        else {
            server('/file/changeAlbumName', { id, name: title })
            .then(result => {
                if(result) {
                    setUpdate(update + 1);
                    e.target.src = editImg;
                    setTitleDisabled(true);
                }
            })
        }
    }

    function deletePhoto(src) {
        server('/file/deletePhoto', { src })
        .then(result => {
            if(result) setUpdate(update + 1);
        })
    }

    return(
        <div className='page'>
            {userData && <RightMenu id={userData._id} username={userData.username}/>}
            {userData && <LeftMenu id={userData._id}/>}

            <div className='album_title'>
                <input value={title} onChange={e => setTitle(e.target.value)} disabled={titleDisabled}/>
                {userData._id == userID && <img className='album_title_changeName' src={editImg} onClick={changeName}/>}
                {userData._id == userID &&
                <div className='album_input_wrapper'>
                    <div className='album_input_text'>Загрузить фото</div>
                    <input type='file' className='album_input' accept='image/*' onChange={loadPhoto}/>
                    <div className='album_input_back1'></div>
                    <div className='album_input_back2'></div>
                </div>}
            </div>
            <div className='album_photos'>
                {photos.map((photo, i) => 
                    <div className='album_photo_wrapper' key={i}>
                        {userData._id == userID && <img className='album_photo_delete' src={deleteImg} onClick={() => deletePhoto(photo)}/>}
                        <img className='album_photo' src={serverUrl + photo} onClick={() => {setSelectImage(photo); setShowFullscreenImage(!showFullscreenImage)}}/>
                    </div>
                )}
            </div>
            {showFullscreenImage && <FullscreenImage selectImage={selectImage} images={photos}/>}
        </div>
    )
}