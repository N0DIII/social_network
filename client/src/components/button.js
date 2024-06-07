export default function Button(props) {
    const { title, onClick } = props;

    return(
        <div className='button_wrapper' onClick={onClick}>
            <div className='button_title'>{title}</div>
            <div className='button_back_1'></div>
            <div className='button_back_2'></div>
        </div>
    )
}