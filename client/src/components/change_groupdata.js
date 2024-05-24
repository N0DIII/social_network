const { useState, useEffect } = require('react');
const { server } = require('../server');
const { useInput } = require('../hooks/useInput.js');
const serverUrl = require('../server_url');

const LoadAvatar = require('./load_avatar').default;
const Input = require('./input').default;
const Button = require('./button').default;

export default function ChangeGroupData(props) {
    const { close, id, select, curName, curDescription, setError, avatarName } = props;

    const [avatar, setAvatar] = useState();
    const [categories, setCategories] = useState([]);
    const [selectCategories, setSelectCategories] = useState(select);
    const name = useInput(curName);
    const description = useInput(curDescription);

    useEffect(() => {
        server('/group/getCategories').then(result => setCategories(result));

        const keydown = e => {
            if(e.key == 'Escape') close();
        }

        window.addEventListener('keydown', keydown);

        return () => window.removeEventListener('keydown', keydown);
    }, [])

    function selectChange(e) {
        const options = [...e.target.selectedOptions];
        const values = options.map(option => option.value);
        setSelectCategories(values);
    }

    function editGroup() {
        server('/group/editGroup', { id, avatar, name: name.value, description: description.value, categories: selectCategories })
        .then(result => {
            if(result.error) setError([true, result.message]);
            else window.location.reload();
        })
    }

    return(
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                <div className='dataform_avatar'>
                    <LoadAvatar src={`${serverUrl}/groups/${id}/avatar_${avatarName}.png`} setAvatarUrl={setAvatar}/>
                </div>
                <div className='dataform_input'><Input { ...name } placeholder='Название'/></div>
                <select className='dataform_select' multiple value={selectCategories} onChange={selectChange}>
                    <option className='dataform_option dataform_option_title' disabled>Категории</option>
                    {categories.map((category, i) =>  <option key={i} className='dataform_option' value={category._id}>{category._id}</option>)}
                </select>
                <textarea className='dataform_textarea' { ...description } maxLength={200} placeholder='Описание'></textarea>
                <div className='dataform_button'><Button title='Сохранить' onclick={editGroup}/></div>
            </div>
        </div>
    )
}