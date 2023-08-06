window.addEventListener('load', () => {
    document.querySelectorAll('pre').forEach(preElem => {
        const codeElem = preElem.querySelector('code');

        const cpBtn = document.createElement('button');
        cpBtn.textContent = 'copy';
        cpBtn.classList.add('code-copy-btn');

        cpBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeElem.textContent);
            cpBtn.innerHTML = 'ok!';
            setTimeout(() => (cpBtn.innerHTML = 'copy'), 1000);
        });

        preElem.insertAdjacentElement("beforebegin", cpBtn);
    });
});