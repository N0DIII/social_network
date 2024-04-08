const { Link } = require('react-router-dom');
const serverUrl = require('../server_url.js');

require('../styles/albumlist.css');
require('../styles/load.css');

export default function Albumlist(props) {
    const { items, isOwner, deleteAlbum, setConfirm } = props;

    if(items == null || items == undefined) {
        return(
            <div className='albumlist_albums_scroll'>
                <div className='albumlist_albums'>
                    <div className='albumlist_album'>
                        <div className='load_wrapper'>
                            <div className='load_div'></div>
                        </div>
                    </div>
                    <div className='albumlist_album'>
                        <div className='load_wrapper'>
                            <div className='load_div'></div>
                        </div>
                    </div>
                    <div className='albumlist_album'>
                        <div className='load_wrapper'>
                            <div className='load_div'></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='albumlist_albums_scroll'>
                <div className='albumlist_albums'>
                    {items.length == 0 && <div className='albumlist_noAlbums'>Нет альбомов</div>}
                    {items.map((item, i) => 
                        <div className='albumlist_album' key={i}>
                            {isOwner && <img className='albumlist_album_delete' src='/images/delete.png' onClick={() => setConfirm([true, deleteAlbum, [item._id]])}/>}
                            <div className='albumlist_album_name'>{item.name}</div>
                            <Link className='albumlist_album_link' to={`/album/${item._id}`}>
                                {item.cover != null && <img className='albumlist_album_preview' src={serverUrl + item.cover}/>}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}