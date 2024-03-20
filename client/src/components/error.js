const { useState } = require('react');

require('../styles/error.css');

const Button = require('./button.js').default;

export default function Error(props) {
    //const { show, setShow } = props;
    const { func } = props;

    return(
        <div className='error_wrapper'>
            <div className='error_block'>
                Произошла ошибка Попробуйте позже
                {func == undefined && <Button title='Закрыть' onclick={() => window.location.reload()}/>}
                {func != undefined && <Button title='Закрыть' onclick={func}/>}
            </div>
        </div>
    )
}