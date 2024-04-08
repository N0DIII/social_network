const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server, serverFile } = require('../server.js');

require('../styles/album.css');

const Photolist = require('./photolist').default;
const AlbumTitle = require('./album_title').default;

export default function Album(props) {
    const { userData, setError, setConfirm } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [album, setAlbum] = useState(null);
    const [photos, setPhotos] = useState(null);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        server('/album/getAlbum', { id })
        .then(result => {
            if(!result.error) setAlbum(result.album);
            else setError([true, result.message]);
        })
        server('/album/getPhotos', { id })
        .then(result => {
            if(!result.error) setPhotos(result.photos);
            else setError([true, result.message]);
        })
    }, [userData, id])

    function deletePhoto(src, id) {
        server('/album/deletePhoto', { src, id })
        .then(result => {
            if(!result.error) setPhotos(photos.filter(photo => photo.src != src));
            else setError([true, result.message]);
        })
    }

    function loadFile(e) {
        if(e.target.files && e.target.files[0]) {
            setPhotos([...photos, { type: 'load' }]);

            serverFile('/album/loadPhoto', { album: id, user: userData._id }, e.target.files[0])
            .then(result => {
                if(result.error) {
                    setError([true, result.message]);
                    e.target.value = null;
                    setPhotos(photos);
                }
                else {
                    setPhotos([...photos, result.photo]);
                    e.target.value = null;
                }
            })
        }
    }

    if(!album || !photos) {
        return(
            <div className='page'>
                <div className='page_error'>Такого альбома нет</div>
            </div>
        )
    }

    return(
        <div className='page'>
            <div className='page_title'>
                <AlbumTitle
                    id={id}
                    title={album?.name}
                    isOwner={userData._id == album?.user ? true : false}
                    loadFile={loadFile}
                    setError={setError}
                />
            </div>

            <Photolist 
                items={photos}
                isOwner={userData._id == album?.user ? true : false}
                deletePhoto={deletePhoto}
                setError={setError}
                setConfirm={setConfirm}
            />
        </div>
    )
}