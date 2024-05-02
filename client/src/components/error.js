const { useEffect } = require('react');

require('../styles/error.css');

const Button = require('./button.js').default;

export default function Error(props) {
    const { params } = props;

    useEffect(() => {
        const keydown = e => {
            if(e.key == 'Enter') params[1](false);
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [])

    return(
        <div className='error_wrapper' style={params[0][0] ? {display: 'grid'} : {display: 'none'}}>
            <div className='error_block'>
                {params[0][1]}
                <Button title='Закрыть' onclick={() => params[1](false)}/>
            </div>
        </div>
    )
}