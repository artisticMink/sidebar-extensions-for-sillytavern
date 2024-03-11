'use strict';

/**
 * Retrieves the DOM element with the specified ID.
 *
 * @param {string} id - The ID of the DOM element to retrieve.
 * @return {Element} The DOM element with the specified ID.
 */
export function getDomElement(id) {
    return document.getElementById(id);
}

/**
 * Clears the content of a DOM element.
 *
 * @param {HTMLElement} element - The DOM element to be cleared.
 */
export function clearDomElement(element) {
    element.innerText = '';
}

/**
 * Adds the specified children elements to the given local element.
 *
 * @param {HTMLElement} localElement - The local element to which children will be added.
 * @param {Array<HTMLElement>} children - An array of child elements to be added.
 */
export function addChildrenToLocalElement(localElement, children) {
    localElement.append(...children);
}

/**
 * Returns a new array of cloned child nodes from the given node,
 * excluding the first child node.
 *
 * @param {HTMLElement} node - The node to clone child nodes from.
 * @return {Node[]} - New array of cloned child nodes, excluding the first child node.
 */
export function cloneWithoutFirstChild(node) {
    const clonedChildNodes = Array.from(node.childNodes).map(child => child.cloneNode(true));
    clonedChildNodes.shift();
    return clonedChildNodes;
}

/**
 * Creates a DOM element with the given name, attributes, and optional callback function.
 * Adds an event listener for the specified event type if a callback is provided.
 *
 * @param {string} name - The name of the DOM element to create.
 * @param content
 * @param {Object} [attributes={}] - The attributes to set for the DOM element (key-value pairs).
 * @param {Function|null} [callback=null] - The callback function to be invoked when the event occurs.
 * @param {string} [eventType='click'] - The type of event to listen for (default: 'click').
 * @return {Element} The newly created DOM element.
 */
export function createDomElement(name,
                                 content,
                                 attributes = {},
                                 callback = null,
                                 eventType = 'click') {
    const domElement = document.createElement(name);

    if (content instanceof HTMLElement) {
        domElement.append(content);
    } else {
        domElement.innerText = content;
    }

    if (callback) {
        domElement.addEventListener(eventType, callback);
    }

    Object.entries(attributes).forEach(([key, value]) => domElement.setAttribute(String(key), String(value)));

    return domElement;
}

/**
 * Retrieves the content of a template file.
 *
 * @param extensionFolderPath
 * @param {string} templateName - The name of the template file without the file extension.
 * @returns {Promise<string>} - A Promise that resolves with the content of the template file as a string.
 */
export async function getTemplate(extensionFolderPath, templateName) {
    const response = await fetch((`${extensionFolderPath}/${templateName}.html`));

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}, ${response.statusText}`);
    }

    return await response.text();
}
