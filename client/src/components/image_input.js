const { useState } = require('react');

require('../styles/image_input.css');

const plusImg = require('../images/plus.png');

export default function ImageInput(props) {
    const { setValue, defaultSrc } = props;

    const [preview, setPreview] = useState(defaultSrc != undefined ? defaultSrc : '');
    const [style, setStyle] = useState({display: 'none'});

    function loadImage(e) {
        if(e.target.files && e.target.files[0]) {
            let reader = new FileReader();

            reader.onloadend = e => {
                setStyle({});
                setPreview(e.target.result);
                setValue(e.target.result);
            }

            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return(
        <div className='imageInput_wrapper'>
            <img className='imageInput_text' src={plusImg}/>
            <img className='imageInput_preview' src={preview} style={style}/>
            <input type='file' className='imageInput_input' onChange={loadImage}/>
        </div>
    )
}