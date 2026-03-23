import { useState } from 'react'


//The language selector likely needs work regarding its core functionality, but for now it will switch the language variable to what was chosen.
function LanguageSelector(){
    const [isLanguageToolOpen, setLanguageTool] = useState(false);
    function handleLanguageToggle(){
        setLanguageTool(!isLanguageToolOpen);
    }
    const [selectedLanguage, setLanguage] = useState("English");
    function handleLanguageChange(event){
        setLanguage(event.target.value);
    }
    return(
        <html className="LanguageSelector">
            <button className="LanguageButton" onClick={handleLanguageToggle}>
                Sample Text
            </button>
            {isLanguageToolOpen ? (
                <html>
                    <button className="LanguageOption" onClick={handleLanguageChange} value="English">
                        English
                    </button>
                    <button className="LanguageOption" onClick={handleLanguageChange} value="Spanish">
                        Spanish
                    </button>
                </html>
            ) : ( <></> )}
        </html>
    )
}

export default LanguageSelector;