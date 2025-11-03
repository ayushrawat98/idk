const replyButton = document.querySelectorAll(".replyButton")
let newPostWindow = document.querySelector('.newPostWindow')
const dragHeader = document.getElementById('dragHeader')
const textbox = document.getElementById('content')
const closeButton = document.querySelector(".closeButton")
const thumbnails = document.querySelectorAll(".thumbnail")


thumbnails.forEach(thumbnail => thumbnail.addEventListener('click', () => {
	let temp = thumbnail.parentElement.querySelector('.fullsizeMedia')
	temp?.toggleAttribute('hidden')
	if (temp.tagName == "VIDEO") {
		temp.pause()
	}
}))


closeButton.addEventListener('click', () => {
	newPostWindow.toggleAttribute('hidden')
})

replyButton.forEach(btn => {
	btn.addEventListener('click', () => {
		// alert(btn.dataset.postNumber)
		if (newPostWindow.hasAttribute('hidden')) {
			newPostWindow.toggleAttribute('hidden')
		}
		textbox.value += ">>" + btn.dataset.postNumber + "\n"
	})
})

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


//for showing popup on >>123 click
const link = document.querySelectorAll('[data-post-number-link]')
link.forEach(l => {
	l.addEventListener('click', (e) => {
		e.preventDefault()
		e.stopPropagation()
		const oldpopup = document.getElementById('mousePopup')
		if (oldpopup) {
			oldpopup.remove()
		}
		const targetId = l.getAttribute('data-post-number-link')
		const targetElement = document.getElementById(targetId)
		//if no target element or popup already present , return
		if (!targetElement || document.getElementById('mousePopup')) {
			return;
		}
		const popup = targetElement.cloneNode(true)
		popup.removeAttribute('id')
		popup.id = 'mousePopup'
		popup.style.position = 'fixed'
		popup.style.zIndex = '3'
		popup.style.backgroundColor = 'white'
		popup.style.left = '10px'
		popup.style.top = (e.clientY - targetElement.offsetHeight - 10) + 'px'
		popup.addEventListener('click', (e) => e.stopPropagation())

		document.body.appendChild(popup)
	})
})

document.body.addEventListener('click', (e) => {
	const popup = document.getElementById('mousePopup')
	if (popup) {
		popup.remove()
	}
})

// const ws = new WebSocket('wss://indiachan.gay/ws')


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

// let username = sessionStorage.getItem('username')
// if(username == null){
// 	sessionStorage.setItem('username', 'Anonymous-' + Math.trunc(Math.random()*100000))
// 	username = sessionStorage.getItem('username')
// }
// document.getElementById('name').value = username