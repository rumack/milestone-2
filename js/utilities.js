// DOM traversing and selections

// A utility function to select all siblings of an element
export const getAllSiblings = (element) => {
	const parent = element.parentNode;
	const children = [...parent.children];
    return children.filter(child => child !== element);
}