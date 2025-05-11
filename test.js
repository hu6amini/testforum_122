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

    function updateTimeagoElement(element) {
        // Get datetime attribute if available, otherwise fallback to title or text content
        const dateString = element.getAttribute('datetime') || 
                          element.getAttribute('title') || 
                          element.textContent.trim();
        
        const date = parseDate(dateString);
        if (date.isValid()) {
            const timeElement = document.createElement('time');
            timeElement.className = 'u-dt';
            timeElement.setAttribute('dir', 'auto');
            timeElement.setAttribute('datetime', date.format());
            timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
            timeElement.textContent = formatDate(date);
            element.replaceWith(timeElement);
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
        if (element.classList.contains('timeago')) return; // Handled separately
        
        let rawText = element.getAttribute('title') || element.textContent.trim();
        
        if (element.children.length && element.children[0].tagName === 'SPAN') {
            rawText = element.childNodes[element.childNodes.length - 1].textContent.trim();
        }

        const date = parseDate(rawText);
        if (date.isValid()) {
            if (element.classList.contains('st-emoji-notice-time')) {
                element.textContent = formatDate(date);
                element.setAttribute('datetime', date.format());
                element.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
            } else {
                const timeElement = document.createElement('time');
                timeElement.className = 'u-dt';
                timeElement.setAttribute('dir', 'auto');
                timeElement.setAttribute('datetime', date.format());
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
                timeElement.textContent = formatDate(date);
                element.replaceWith(timeElement);
            }
        }
    }

    function processTimeElements() {
        // Handle timeago elements first
        document.querySelectorAll('.timeago').forEach(updateTimeagoElement);
        
        // Then handle edit elements
        document.querySelectorAll('.post .edit').forEach(updateEditElement);
        
        // Then handle other elements
        const selectors = [
            '.big_list .zz .when',
            '.st-emoji-epost-time',
            '.st-emoji-notice-time',
            '.post-date',
            '.time',
            '.date',
            '.post .title2.top .when'
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
                    // Check for timeago elements first
                    if (node.matches('.timeago')) {
                        updateTimeagoElement(node);
                    }
                    node.querySelectorAll('.timeago').forEach(updateTimeagoElement);
                    
                    // Then check edit elements
                    if (node.matches('.post .edit')) {
                        updateEditElement(node);
                    }
                    node.querySelectorAll('.post .edit').forEach(updateEditElement);
                    
                    // Then check other elements
                    const selectors = [
                        '.big_list .zz .when',
                        '.st-emoji-epost-time',
                        '.st-emoji-notice-time',
                        '.post-date',
                        '.time',
                        '.date',
                        '.post .title2.top .when'
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
