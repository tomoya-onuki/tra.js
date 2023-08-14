window.addEventListener('load', () => {
    document.querySelectorAll('pre').forEach(preElem => {
        const codeElem = preElem.querySelector('code');

        const cpBtnElem = document.createElement('div');
        cpBtnElem.classList.add('copy-btn-box');

        const copiedTextElem = document.createElement('span');
        copiedTextElem.classList.add('copy-msg');
        copiedTextElem.textContent = 'copied!';

        const cpLogoElem = document.createElement('span');
        cpLogoElem.classList.add('copy-btn');
        cpLogoElem.classList.add('material-symbols-outlined');
        cpLogoElem.textContent = 'content_copy';

        cpBtnElem.appendChild(copiedTextElem);
        cpBtnElem.appendChild(cpLogoElem);

        cpBtnElem.addEventListener('click', () => {
            copiedTextElem.style.display = 'inline-block';

            let ms = 1000;
            copiedTextElem.style.transition = "opacity " + ms + "ms";
            setTimeout(() => copiedTextElem.style.opacity = 0, 700);
            setTimeout(() => {
                copiedTextElem.style.opacity = 1;
                copiedTextElem.style.display = "none";
            }, ms);

            navigator.clipboard.writeText(codeElem.textContent);
        });

        preElem.insertAdjacentElement("beforebegin", cpBtnElem);
    });
});