const { useState, useEffect } = require('react');
const { server, serverFile } = require('../server');

const ImageInput = require('./image_input').default;
const Button = require('./button').default;

export default function AddPost(props) {
    const { close, user, setError, edit, post, type } = props;

    const [text, setText] = useState(edit ? post.text : '');
    const [images, setImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    function savePost() {
        if(!edit) {
            serverFile('/post/addPost', { creator: user, text, type }, images)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else close();
            })
        }
        else {
            serverFile('/post/editPost', { post: post._id, creator: user, text, type, deleted: deletedImages }, images)
            .then(result => {
                if(result.error) setError([true, result.message]);
                else close();
            })
        }
    }

    return(
        <div className='dataform_wrapper'>
            <div className='dataform'>
                <img className='dataform_close' src='/images/cross.png' onClick={close}/>
                <ImageInput value={setImages} defaultValue={edit ? post.files : []} deletedValue={setDeletedImages}/>
                <textarea className='dataform_textarea' value={text} onChange={e => setText(e.target.value)}/>
                <div className='dataform_button'><Button title='Сохранить' onclick={savePost}/></div>
            </div>
        </div>
    )
}