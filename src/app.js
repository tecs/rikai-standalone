const fs = require('fs');

window.addEventListener('load', () => {
    chrome.browserAction.onClicked.__listeners.forEach(f => f(0));

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', () => {
        document.getElementById('app-options').innerHTML = xhr.responseText;

        const optionsScript = document.createElement('script');
        optionsScript.src = 'options.js';
        optionsScript.addEventListener('load', () => fillVals());
        document.head.appendChild(optionsScript);

        document.getElementById('optform').onsubmit = e => {
            toggleOptions();
            e.preventDefault();
        }
    });
    xhr.open('GET', 'options.html', true);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();
});

const toggleOptions = () => {
    if (document.body.classList.contains('options-visible')) {
        getVals();
    }
    document.body.classList.toggle('options-visible');
};

const openFile = (file) => document.getElementById('content-editor').innerText = fs.readFileSync(file);
