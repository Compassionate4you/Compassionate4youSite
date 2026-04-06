import { useState } from 'react'


//I'm not sure what size font we are going to be using, so I selected 12 as the default.
function TextSizeControl(){
    const [isTextSliderOpen, setTextSlider] = useState(false);
    function handleTextSlider(){
        setTextSlider(!isTextSliderOpen);
    }

    const [currentTextSize, setTextSize] = useState(12);
    function handleTextSizeChange(event){
        setTextSize(event.target.value);
    }
    return(
        <html className="TextSizeControl">
            <button className="TextSizeControlButton" onClick={handleTextSlider}>
                Sample Text
            </button>
            {isTextSliderOpen ? (
                <html>
                    <label for="textSize">Text Size:</label>
                    <input type="range" id="textSize" min="8" max="25" step="1" value={inputValue} onChange={handleTextSizeChange}></input>
                </html>
            ) : (
                <></>
            )
            }
        </html>
    )
}

export default TextSizeControl;