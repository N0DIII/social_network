import { useState, useEffect, useContext, useCallback } from 'react';

import { Context } from './context';

export default function Fullscreen() {
    const { fFiles, sFFile, setSFFile, fParams, setFParams } = useContext(Context);

    const [index, setIndex] = useState();

    useEffect(() => {
        const keydown = e => {
            if(e.key == 'Escape') setFParams({ show: false });
            else if(e.key == 'ArrowLeft') prev();
            else if(e.key == 'ArrowRight') next();
        }

        document.addEventListener('keydown', keydown);

        return () => document.removeEventListener('keydown', keydown);
    }, [index])

    useEffect(() => {
        if(sFFile == undefined) return;

        setIndex(fFiles.findIndex(file => file.src == sFFile.src));
    }, [sFFile, fFiles])

    const prev = useCallback(() => {
        if(index > 0) setSFFile(fFiles[index - 1]);
    }, [fFiles, index])

    const next = useCallback(() => {
        if(index < fFiles.length - 1) setSFFile(fFiles[index + 1]);
    }, [fFiles, index])

    if(fParams.show) return(
        <div className='fullscreen_wrapper'>
            <img className='fullscreen_close' src='/images/cross2.png' onClick={() => setFParams({ show: false })} />
            {fFiles.length != 0 && index > 0 && <img className='fullscreen_previous' src='/images/leftArrow.png' onClick={prev} />}
            {fFiles.length != 0 && index < fFiles.length - 1 && <img className='fullscreen_next' src='/images/rightArrow.png' onClick={next} />}

            {sFFile.mimetype == 'image' && <img className='fullscreen_file' src={`${fParams.link}${sFFile.src}`} />}
            {sFFile.mimetype == 'video' && <video className='fullscreen_file' src={`${fParams.link}${sFFile.src}`} controls />}
        </div>
    )
}