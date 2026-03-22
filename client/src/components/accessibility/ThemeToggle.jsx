import { useState } from 'react'


//For now I only have the high contast and light/dark themes, but we could always add more if we need to.
function ThemeToggle(){
    const [isThemeToggleOpen, setThemeToggle] = useState(false);
    function handleThemeToggle(){
        setThemeToggle(!isThemeToggleOpen);
    }

    const [selectedTheme, setTheme] = useState("light");
    function handleThemeChange(event){
        setTheme(event.target.value);
    }
    
    return(
        <html className="ThemeToggle">
            <button className="ThemeToggleButton" onClick={handleThemeToggle}>
                Sample Text
            </button>
            {isThemeToggleOpen ? (
                <html>
                    <button className="ThemeOption" value="light" onClick={handleThemeChange}>
                        Light Theme
                    </button>
                    <button className="ThemeOption" value="dark" onClick={handleThemeChange}>
                        Dark Theme
                    </button>
                    <button className="ThemeOption" value="highContrast" onClick={handleThemeChange}>
                        High Contrast Theme
                    </button>"
                </html>
            ) : (
                <></>
            )
            }
        </html>
    )
}

export default ThemeToggle;