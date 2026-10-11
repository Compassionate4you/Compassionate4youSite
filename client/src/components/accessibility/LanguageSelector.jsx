import { useTranslation } from 'react-i18next';

function LanguageSelector() {
    const { t, i18n } = useTranslation();
    return (
        <label className="LanguageSelector">
            <span>{t('accessibility.selectLanguage')}</span>
            <select
                className="LanguageButton"
                value={i18n.language.split('-')[0]}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                aria-label={t('accessibility.selectLanguage')}
            >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="ur">اردو</option>
            </select>
        </label>
    );
}

export default LanguageSelector;
