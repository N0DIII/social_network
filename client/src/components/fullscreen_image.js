const { useEffect, useState } = require('react');
const serverUrl = require('../server_url.js');

require('../styles/fullscreen_image.css');

const nextImg = require('../images/rightArrow.png');
const previousImg = require('../images/leftArrow.png');
const closeImg = require('../images/cross2.png');

export default function FullscreenImage(props) {
    const { selectImage, images, setShow } = props;

    const [image, setImage] = useState(selectImage);
    const [i, setI] = useState(0);

    useEffect(() => {
        setI(images.indexOf(selectImage));
    }, [])

    function switching(k) {
        if((i == 0 && k == -1) || (i == images.length - 1 && k == 1)) return;

        setImage(images[i + k]);
        setI(i + k);
    }

    return(
        <div className='fullscreenImage_wrapper'>
            <img className='fullscreenImage_close' src={closeImg} onClick={() => setShow(false)}/>
            <img className='fullscreenImage_previous' src={previousImg} style={i == 0 ? {opacity: '0', cursor: 'default'} : {}} onClick={() => switching(-1)}/>
            {(image.split('_')[1]).split('.')[0] == 'image' &&
            <img className='fullscreenImage_image' src={serverUrl + image}/>}
            {(image.split('_')[1]).split('.')[0] == 'video' &&
            <video className='fullscreenImage_image' src={serverUrl + image} controls/>}
            <img className='fullscreenImage_next' src={nextImg} style={i == images.length - 1 ? {opacity: '0', cursor: 'default'} : {}} onClick={() => switching(1)}/>
        </div>
    )
}