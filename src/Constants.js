// eslint-disable-next-line no-unused-vars
export const REGEX = '^(\\S+(\\w+)? *(\\W+)?)*$';
export function setElementAttrs(elementType, nameField, id, placeholder, required, pattern ) {
	const element = document.createElement(elementType);
	element.setAttribute('name', nameField);
	element.setAttribute('id', id);
	element.setAttribute('placeholder', placeholder);
	element.required = required;
	element.pattern = pattern;
	return element;
}