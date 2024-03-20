const { useState } = require('react');

require('../styles/input.css');

const errorImg = require('../images/error.png');
const eyeImg = require('../images/eye.png');
const crossedEyeImg = require('../images/crossedEye.png');

export default function Input(props) {
    const { type, error, placeholder, setValue, value, min, max } = props;

    const [isShow, setIsShow] = useState(true);
    const [inType, setInType] = useState(type);
    const [passwordButtonImg, setPasswordButtonImg] = useState(eyeImg);

    function input(e) {
        setValue(e.target.value)
    }

    function showPassword() {
        if(isShow) {
            setInType('text');
            setPasswordButtonImg(crossedEyeImg);
            setIsShow(false);
        }
        else {
            setInType('password');
            setPasswordButtonImg(eyeImg);
            setIsShow(true);
        }
    }

    return(
        <div className='input_wrapper'>
            {value == undefined && <input type={inType} placeholder={placeholder != undefined ? placeholder : ''} onInput={input}/>}
            {value != undefined && min == undefined && max == undefined && <input type={inType} placeholder={placeholder != undefined ? placeholder : ''} value={value} onInput={input}/>}
            {value != undefined && min != undefined && max != undefined && <input min={min} max={max} type={inType} placeholder={placeholder != undefined ? placeholder : ''} value={value} onInput={input}/>}

            {type == 'password' && <img src={passwordButtonImg} onClick={showPassword}/>}

            {error != undefined && error != '' &&
            <div className='input_error'>
                <img src={errorImg}/>
                <div className='input_error_text'>{error}</div>
            </div>}
        </div>
    )
}