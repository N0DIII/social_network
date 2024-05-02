const { useInput } = require('../hooks/useInput.js');
const { auth } = require('../auth.js');
const { server } = require('../server.js');

const Button = require('./button.js').default;
const Password = require('./password.js').default;
const Input = require('./input.js').default;

export default function Login(props) {
    const { setUserData, setError } = props;

    const username = useInput('');
    const password = useInput('');

    async function login() {
        server('/auth/login', { username: username.value, password: password.value })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else {
                localStorage.setItem('token', result.token);

                auth().then(result => {
                    setUserData(result);
                    window.location.assign('/');
                })
            }
        })
    }

    return(
        <div className='form_wrapper'>
            <div className='form'>
                <div className='form_title'>Вход</div>
                <Input { ...username } placeholder='Имя пользователя'/>
                <Password { ...password } placeholder='Пароль'/>
                <Button title='Войти' onclick={login}/>
                <div className='form_switch'>
                    Ещё нет аккаунта?
                    <a className='form_switch_link' href='/registration'>Создать</a>
                </div>
            </div>
        </div>
    )
}