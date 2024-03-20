require('../styles/error.css');

const Button = require('./button.js').default;

export default function Error(props) {
    const { params } = props;

    return(
        <div className='error_wrapper' style={params[0] ? {display: 'grid'} : {display: 'none'}}>
            <div className='error_block'>
                Произошла ошибка Попробуйте позже
                <Button title='Закрыть' onclick={() => params[1](false)}/>
            </div>
        </div>
    )
}