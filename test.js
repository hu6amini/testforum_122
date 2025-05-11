document.addEventListener("DOMContentLoaded", function() {
    function parseDate(dateString) {
        const formats = [
            'M/D/YYYY, h:mm A',
            'YYYY/M/D H:mm',
            'YYYY-MM-DDTHH:mm:ssZ'
        ];
        for (const format of formats) {
            const date = moment(dateString, format, true);
            if (date.isValid()) return date;
        }
        return moment(new Date(dateString));
    }

    function formatDate(date) {
        const now = moment();
        const diff = now.diff(date, 'hours');
        
        if (diff < 24) {
            return date.fromNow();
        } else if (diff < 48) {
            return 'Yesterday at ' + date.format('h:mm A');
        } else if (diff < 168) {
            return date.format('dddd [at] h:mm A');
        } else {
            return date.format('MMM D, YYYY');
        }
    }

    function updateEditElement(element) {
        const text = element.textContent.trim();
        const match = text.match(/^(Edited by .+?) - (.+)$/);
        
        if (match) {
            const prefix = match[1];
            const dateString = match[2];
            
            const date = parseDate(dateString);
            if (date.isValid()) {
                const formattedDate = date.format('MMM D, YYYY');
                element.textContent = `${prefix}: ${formattedDate}`;
                
                const timeElement = document.createElement('time');
                timeElement.className = 'u-dt';
                timeElement.setAttribute('datetime', date.format());
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
                timeElement.textContent = formattedDate;
                
                element.innerHTML = `${prefix}: `;
                element.appendChild(timeElement);
            }
        }
    }

    function updateTimeElement(element) {
        if (element.closest('.edit')) return;
        
        let rawText = element.getAttribute('title') || element.textContent.trim();
        
        if (element.children.length && element.children[0].tagName === 'SPAN') {
            rawText = element.childNodes[element.childNodes.length - 1].textContent.trim();
        }

        const date = parseDate(rawText);
        if (date.isValid()) {
            // Special handling for st-emoji-notice-time (preserve original element)
            if (element.classList.contains('st-emoji-notice-time')) {
                element.textContent = formatDate(date);
                element.setAttribute('datetime', date.format());
                element.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
            } 
            // Normal handling for other elements including timeago
            else {
                const timeElement = document.createElement('time');
                timeElement.className = 'u-dt' + (element.classList.contains('timeago') ? ' timeago' : '');
                timeElement.setAttribute('dir', 'auto');
                timeElement.setAttribute('datetime', date.format());
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
                timeElement.textContent = formatDate(date);
                element.replaceWith(timeElement);
            }
        }
    }

    function processTimeElements() {
        document.querySelectorAll('.post .edit').forEach(updateEditElement);
        
        const selectors = [
            '.big_list .zz .when',
            '.st-emoji-epost-time',
            '.st-emoji-notice-time',
            '.post-date',
            '.time',
            '.date',
            '.post .title2.top .when',
            '.notification-date .timeago' // Added this selector
        ];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(updateTimeElement);
        });
    }

    processTimeElements();

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    if (node.matches('.post .edit')) {
                        updateEditElement(node);
                    }
                    node.querySelectorAll('.post .edit').forEach(updateEditElement);
                    
                    const selectors = [
                        '.big_list .zz .when',
                        '.st-emoji-epost-time',
                        '.st-emoji-notice-time',
                        '.post-date',
                        '.time',
                        '.date',
                        '.post .title2.top .when',
                        '.notification-date .timeago' // Added this selector
                    ];
                    selectors.forEach(selector => {
                        if (node.matches(selector)) updateTimeElement(node);
                        node.querySelectorAll(selector).forEach(updateTimeElement);
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
