'use strict';

import { extension_settings } from '../../../../extensions.js';
import { callPopup, characters, saveSettingsDebounced, this_chid } from '../../../../../script.js';

const defaultPopupMessage = `<br>
    <p><b>Bind the current settings to the selected character?</b></p>
    <p>Your settings are copied to this character and loaded whenever this character is selected. If you change the character name, your settings will be lost.</p>`;

/**
 * Extension Settings Manager.
 *
 * This class acts as a wrapper for the extension_settings configuration array.
 * It takes care of loading extension settings, applying defaults, creating character
 * specific configurations and swapping between the global and character-specific settings
 * source.
 */
export default class ExtensionSettingsManager {
    static CHARACTER_SETTINGS_CONFIGURATION_KEY = 'characters';

    #extensionName = null;
    #defaultSettings = null;
    #extensionSettings = null;
    #popupMessage = defaultPopupMessage;

    /**
     * Create a new Extension Settings Manager.
     *
     * On instantiation, the extension settings will be loaded and
     * the default settings are applied onto the extension settings configuration.
     * Adding new values should they not already exist.
     *
     * @param {string} extensionName - The name of the extension.
     * @param {object} [defaultSettings={}] - The default settings for the extension (optional).
     * @param characterSettingsConfigurationKey
     */
    constructor(extensionName,
        defaultSettings = {},
        characterSettingsConfigurationKey = ExtensionSettingsManager.CHARACTER_SETTINGS_CONFIGURATION_KEY)
    {
        this.#extensionName = extensionName;
        this.#defaultSettings = defaultSettings;

        this.#loadSettings();
    }

    /**
     * Copies the extension settings to the character settings for a given character ID.
     *
     * @param {string} characterId - The ID of the character.
     */
    copySettingsToCharacter(characterId) {
        const name = characters[characterId].data.name;
        const characterSettings = structuredClone(this.#extensionSettings);

        delete characterSettings.characters;

        extension_settings[this.#extensionName].characters[name] = characterSettings;
    }

    /**
     * Swaps the extension settings source to the character settings based on the given character ID.
     * If no character ID is provided, swaps the settings to default settings.
     *
     * @param  characterId - The ID of the character to swap the settings to.
     * @throws {MissingExtensionSettingsError} - If the character settings for the given character ID are not found.
     * @return {string|null} - The name of the character whose settings have been swapped to, or null if no character ID is provided.
     */
    swapToCharacter(characterId) {
        this.swapToGlobalSettings();

        if (characterId) {
            const characterName = characters[characterId].data.name;
            if (Object.prototype.hasOwnProperty.call(this.#extensionSettings.characters, characterName)) {
                this.#extensionSettings = this.#extensionSettings.characters[characterName];
                return characterName;
            }
        }

        return null;
    }

    swapToSelectedCharacter() {
        return this.swapToCharacter(this.getSelectedCharacterId());
    }

    /**
     * Swaps the extension settings source to the global settings.
     * Global settings in this context refers to the extensions global settings.
     *
     * @throws {MissingExtensionSettingsError} - Thrown when the extension settings are missing.
     */
    swapToGlobalSettings() {
        if (this.#extensionName in extension_settings) {
            this.#extensionSettings = extension_settings[this.#extensionName];
        } else {
            throw new MissingExtensionSettingsError(this.#extensionName);
        }
    }

    /**
     * Shows the copy settings popup.
     * Copies current extension settings to the character,
     * then swaps the settings source to said characters configuration.
     *
     * @return {Promise<void>} - A promise
     */
    showCopySettingsPopup() {
        if (!this.getSelectedCharacterId()) throw Error('No character selected to copy settings to.');

        return callPopup(this.#popupMessage, 'confirm').then(accept => {
            if (true !== accept) return;

            this.copySettingsToCharacter(this.getSelectedCharacterId());
            this.swapToCharacter(this.getSelectedCharacterId());
            this.saveSettings();
        });
    }

    /**
     * Persist settings.
     *
     * @throws {SaveSettingsError} if an error occurs while saving the settings.
     */
    saveSettings() {
        try {
            saveSettingsDebounced();
        } catch (error) {
            throw new SaveSettingsError(error);
        }
    }


    /**
     * Retrieves the selected character ID.
     *
     * @returns {string|null} The selected character ID, or null if undefined.
     */
    getSelectedCharacterId() {
        return this_chid ?? null;
    }

    getSelectedCharacterName() {
        return this.getCharacterName(this_chid);
    }

    /**
     * Retrieves the name of a character given its ID.
     *
     * @param {string} characterId - The ID of the character.
     * @throws {InvalidCharacterIdError} Thrown if the character ID is invalid or does not exist.
     * @returns {string} The name of the character associated with the given ID.
     */
    getCharacterName(characterId) {
        if (characterId in characters) {
            return characters[characterId].data.name;
        } else {
            throw new InvalidCharacterIdError();
        }
    }

    /**
     * Loads settings for the extension.
     */
    #loadSettings() {
        const extensionName = this.#extensionName;
        const defaultSettings = this.#defaultSettings;

        extension_settings[extensionName] = extension_settings[extensionName] || {};

        const extensionKeys = Object.keys(extension_settings[extensionName]);
        const defaultKeys = Object.keys(defaultSettings);

        for (const key of defaultKeys) {
            if (!extensionKeys.includes(key)) {
                extension_settings[extensionName][key] = defaultSettings[key];
            }
        }

        this.#extensionSettings = extension_settings[extensionName];
    }

    /**
     * @returns {string|null} The extension name.
     */
    get extensionName() {
        return this.#extensionName;
    }

    /**
     * @returns {array} The extension's default settings.
     */
    get defaultSettings() {
        return this.#defaultSettings;
    }

    /**
     * @returns {array} The currently mounted extension settings.
     */
    get extensionSettings() {
        return this.#extensionSettings;
    }

    /**
     * @returns {string} The popup HTML.
     */
    get popupMessage() {
        return this.#popupMessage;
    }

    /**
     * @returns {string} The popup HTML.
     */
    set popupMessage(popupMessage) {
        this.#popupMessage = popupMessage;
    }
}


export class InvalidCharacterIdError extends Error {
    constructor(message = 'Current character id is not valid.') {
        super(message);
        this.name = 'InvalidCharacterIdError';
    }
}

export class MissingExtensionSettingsError extends Error {
    constructor(extensionName, message = 'Expected configuration not found for extension: ') {
        super(message + extensionName);
        this.name = 'MissingExtensionSettingsError';
    }
}

export class SaveSettingsError extends Error {
    constructor(previousError = null, message = 'Error while trying to persists settings. Settings likely weren\'t persisted.') {
        super(message);
        this.name = 'SaveSettingsError';
        this.previousError = previousError;
    }
}
