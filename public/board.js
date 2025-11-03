
let newPostButton = document.querySelectorAll('.newPostButton')
let newPostWindow = document.querySelector('.newPostWindow')
const dragHeader = document.getElementById('dragHeader')


newPostButton.forEach(element => element.addEventListener('click', () => {
	newPostWindow.toggleAttribute('hidden')
}))
let offsetX = 0, offsetY = 0, isDragging = false;
dragHeader.style.cursor = 'move';
dragHeader.addEventListener('mousedown', (e) => {
	isDragging = true;
	// Record where you clicked
	offsetX = e.clientX - newPostWindow.offsetLeft;
	offsetY = e.clientY - newPostWindow.offsetTop;
	dragHeader.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
	if (!isDragging) return;
	// Move the element
	newPostWindow.style.left = e.clientX - offsetX + 'px';
	newPostWindow.style.top = e.clientY - offsetY + 'px';
});

dragHeader.addEventListener('mouseup', () => {
	isDragging = false;
	dragHeader.style.cursor = 'move';
});

dragHeader.addEventListener('touchstart', (ee) => {
	isDragging = true;
	var e = ee.targetTouches[0];
	// Record where you clicked
	offsetX = e.pageX - newPostWindow.offsetLeft;
	offsetY = e.pageY - newPostWindow.offsetTop;
});

dragHeader.addEventListener('touchmove', (e) => {
	if (!isDragging) return;
	var touchLocation = e.targetTouches[0];
	newPostWindow.style.left = touchLocation.pageX - offsetX + 'px';
	newPostWindow.style.top = touchLocation.pageY - offsetY + 'px';
});

dragHeader.addEventListener('touchend', () => {
	isDragging = false;
});

// const ws = new WebSocket('wss://indiachan.gay/ws')
// ws.addEventListener('message', (e) => {
// 	// console.log(e.data)
// 	let t = document.getElementById("userOnline")
// 	t.textContent = e.data
// })


//copt pasting code
const pasteTextBox = document.getElementById('content');
const imageFileInput = document.getElementById('file');

pasteTextBox.addEventListener('paste', (event) => {
	const items = (event.clipboardData || event.originalEvent.clipboardData).items;
	let imageFile = null;

	for (let i = 0; i < items.length; i++) {
		if (items[i].type.startsWith('image/')) {
			imageFile = items[i].getAsFile();
			break; // Assuming only one image per paste
		}
	}

	if (imageFile) {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(imageFile);
		imageFileInput.files = dataTransfer.files;
		// Prevent default paste behavior in the textbox if desired
		event.preventDefault();
	}
});


let username = sessionStorage.getItem('username')
if(username == null){
	sessionStorage.setItem('username', 'Anonymous-' + Math.trunc(Math.random()*100000))
	username = sessionStorage.getItem('username')
}
document.getElementById('name').value = username