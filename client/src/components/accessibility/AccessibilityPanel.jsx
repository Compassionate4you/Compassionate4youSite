import { useState } from 'react'


//The accessibility panel is missing its styling and some html structure, but for now I wanted to get the base functionality implemented.
function AccessibilityPanel(){
    const [showAccessibilityTools, setAccessibilityTools] = useState(false);
    function handleAccessibilityToggle(){
        setAccessibilityTools(!showAccessibilityTools);
    }
    return(
        <html className="Accessibility">
            <button className="AccessibilityButton" onClick={handleAccessibilityToggle}>
                Sample Text
            </button>
            {showAccessibilityTools ? (
                <html>
                    <LanguageSelector />
                    <TextSizeControl />
                    <ThemeToggle />
                </html>
            ) : (
                <></>
            )
            }
        </html>
    )
}

export default AccessibilityPanel;