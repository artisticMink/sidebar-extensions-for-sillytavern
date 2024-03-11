import { getDomElement, getTemplate } from '../utility.js';

class Defaults {
    static EXTENSION_NAME = 'sidebar-extensions-for-sillytavern';
    static EXTENSION_PATH = `scripts/extensions/third-party/${Defaults.EXTENSION_NAME}`;
    static SIDEBAR = 'ai_response_configuration';
    static CONTAINER = 'ai_response_configuration_extensions';
}

let extensionContainer = null;

/**
 * Represents a visual container for extensions.
 * Each extension can be attached with its own pull-out drawer.
 */
export default class ExtensionContainer {
    #extensionName = null;
    #extensionPath = null;
    #extensionContainerIdentifier = null;

    #sidebar = null;
    #extensionContainer = null;
    #extensionDrawer = null;

    #mountExtensionPromise = null;

    /**
     * Create a new ExtensionContainer instance
     *
     * @param {string} [extensionName=Defaults.EXTENSION_NAME] - The name of the extension.
     * @param {string} [extensionFolderPath=Defaults.EXTENSION_PATH] - The path to the extension folder.
     * @param {string} [sidebarIdentifier=Defaults.SIDEBAR] - The identifier for the sidebar.
     * @param {string} [extensionContainerIdentifier=Defaults.CONTAINER] - The identifier for the extension container.
     */
    constructor(extensionName = Defaults.EXTENSION_NAME,
        extensionFolderPath = Defaults.EXTENSION_PATH,
        sidebarIdentifier = Defaults.SIDEBAR,
        extensionContainerIdentifier = Defaults.CONTAINER,
    ) {
        if (extensionContainer instanceof ExtensionContainer) {
            return extensionContainer;
        }

        this.#extensionName = extensionName;
        this.#extensionPath = extensionFolderPath;
        this.#extensionContainerIdentifier = extensionContainerIdentifier;

        this.#sidebar = getDomElement(sidebarIdentifier);

        if (!this.#sidebar) {
            throw Error('Could not find sidebar with id ' + sidebarIdentifier);
        }

        extensionContainer = this;
    }

    /**
     * Mounts the extension container.
     *
     * @throws {MountingError} If the extension container could not be mounted.
     * @return {Promise<Element>} A promise that resolves with the mounted extension container.
     */
    #mountExtensionContainer() {
        if (this.#mountExtensionPromise) return this.#mountExtensionPromise;

        this.#mountExtensionPromise = new Promise((resolve, reject) => {
            try {
                getTemplate(this.#extensionPath, 'ExtensionContainer')
                    .then(extensionContainerHtml => {
                        this.#sidebar.insertAdjacentHTML('beforeend', extensionContainerHtml);
                        this.#extensionContainer = this.#sidebar.lastElementChild;

                        resolve(this.#extensionContainer);
                    }).catch((error) => {
                        reject(new MountingError('Extension container could not be mounted', error));
                    });
            } catch (error) {
                reject(MountingError('Extension container could not be mounted', error));
            }
        });

        return this.#mountExtensionPromise;
    }

    /**
     * Mounts an extension drawer with the provided drawer label.
     *
     * @async
     * @param {string} drawerLabel - The label of the extension drawer.
     * @returns {Element | null} - The mounted element.
     */
    async mountExtensionDrawer(drawerLabel) {
        const container = await this.#mountExtensionContainer();

        try {
            let containerHtml = await getTemplate(this.#extensionPath,'ExtensionDrawer');
            containerHtml = containerHtml.replace('###label###', drawerLabel);

            container.insertAdjacentHTML('beforeend', containerHtml);
            this.#extensionDrawer = container.lastElementChild.querySelector('.inline-drawer-content');

            return this.#extensionDrawer;
        } catch (error) {
            throw new MountingError('Extension Drawer could not be mounted', error);
        }
    }

    /**
     * Removes the extension drawer from the DOM and sets the extensionDrawer property to null.
     */
    unmountExtensionDrawer() {
        this.#extensionDrawer.remove();
        this.#extensionDrawer = null;
    }

    /**
     * @returns {boolean} true if the component is mounted in the DOM, otherwise false.
     */
    isMounted() {
        this.#sidebar.contains(this.#extensionContainer);
    }

    /**
     * @return {Object} - The extension drawer object.
     */
    get extensionDrawer() {
        return this.#extensionDrawer;
    }
}

class MountingError extends Error {
    constructor(message, previousError = null) {
        super(message);
        this.name = 'MountingError';
        this.previousError = previousError;
    }
}
