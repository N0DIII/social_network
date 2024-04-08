const { useState } = require('react');

require('../styles/input.css');

export default function Input(props) {
    const { type, error, placeholder, setValue, value, min, max } = props;

    const [isShow, setIsShow] = useState(true);
    const [inType, setInType] = useState(type);
    const [passwordButtonImg, setPasswordButtonImg] = useState('/images/eye.png');

    function input(e) {
        setValue(e.target.value)
    }

    function showPassword() {
        if(isShow) {
            setInType('text');
            setPasswordButtonImg('/images/crossedEye.png');
            setIsShow(false);
        }
        else {
            setInType('password');
            setPasswordButtonImg('/images/eye.png');
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
                <img src='/images/error.png'/>
                <div className='input_error_text'>{error}</div>
            </div>}
        </div>
    )
}