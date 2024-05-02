export default function Input(props) {
    const { value, onChange, placeholder } = props;

    return(
        <div className='input_wrapper'>
            <input type='text' placeholder={placeholder} value={value} onChange={onChange}/>
        </div>
    )
}