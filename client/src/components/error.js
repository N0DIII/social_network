require('../styles/error.css');

const Button = require('./button.js').default;

export default function Error(props) {
    const { params } = props;

    if(params[0].length == undefined) {
        return(
            <div className='error_wrapper' style={params[0] ? {display: 'grid'} : {display: 'none'}}>
                <div className='error_block'>
                    Произошла ошибка
                    <Button title='Закрыть' onclick={() => params[1](false)}/>
                </div>
            </div>
        )
    }
    else {
        return(
            <div className='error_wrapper' style={params[0][0] ? {display: 'grid'} : {display: 'none'}}>
                <div className='error_block'>
                    {params[0][1]}
                    <Button title='Закрыть' onclick={() => params[1](false)}/>
                </div>
            </div>
        )
    }
}