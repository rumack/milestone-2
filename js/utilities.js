// DOM traversing and selections

export const getAllSiblings = (element) => {
	const parent = element.parentNode;
	const children = [...parent.children];
    return children.filter(child => child !== element);
}