const { useNavigate } = require('react-router-dom');

require('../styles/not_found.css');

const Button = require('./button').default;

export default function NotFound() {
    const navigate = useNavigate();

    return(
        <div className='page'>
            <div className='notFound_wrapper'>
                Страница не найдена :{'('}
                <div className='notFound_button'>
                    <Button title='На главную' onclick={() => navigate('/')}/>
                </div>
            </div>
        </div>
    )
}