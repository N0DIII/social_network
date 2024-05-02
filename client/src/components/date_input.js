export default function DateInput(props) {
    const { value, onChange, min, max } = props;

    return(
        <div className='input_wrapper'>
            <input type='date' value={value} onChange={onChange} min={min} max={max}/>
        </div>
    )
}