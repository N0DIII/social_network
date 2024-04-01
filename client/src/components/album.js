const { useState, useEffect } = require('react');
const { useNavigate, useParams } = require('react-router-dom');
const { server, serverFile } = require('../server.js');

require('../styles/album.css');

const Photolist = require('./photolist').default;
const AlbumTitle = require('./album_title').default;
const Error = require('./error').default;

export default function Album(props) {
    const { userData } = props;
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;

    const [album, setAlbum] = useState(null);
    const [photos, setPhotos] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if(!userData) return;
        if(!userData._id) return navigate('/login');
        if(localStorage.getItem('closeRightMenu') == '1') document.querySelector('.page').classList.add('closeRightMenu');
        if(localStorage.getItem('closeLeftMenu') == '1') document.querySelector('.page').classList.add('closeLeftMenu');

        server('/album/getAlbum', { id }).then(result => setAlbum(result));
        server('/album/getPhotos', { id }).then(result => setPhotos(result));
    }, [userData, id])

    function deletePhoto(src) {
        server('/file/deletePhoto', { src })
        .then(result => {
            if(result) setPhotos(photos.filter(photo => photo != src));
            else setError(true);
        })
    }

    function loadFile(e) {
        if(e.target.files && e.target.files[0]) {
            setPhotos([...photos, { type: 'load' }]);

            serverFile('/album/loadFile', { album: id, user: userData._id }, e.target.files[0])
            .then(result => {
                if(result.error) setError([true, result.message]);
                else {
                    setPhotos([...photos, result]);
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
            <Error params={[error, setError]}/>

            <div className='page_title'>
                <AlbumTitle
                    id={id}
                    title={album?.name}
                    isOwner={userData._id == album?.user ? true : false}
                    loadFile={loadFile}
                />
            </div>

            <Photolist 
                items={photos}
                isOwner={userData._id == album?.user ? true : false}
                deletePhoto={deletePhoto}
            />
        </div>
    )
}