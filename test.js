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
            return date.fromNow(); // "2 hours ago", "5 minutes ago", etc.
        } else if (diff < 48) {
            return 'Yesterday at ' + date.format('h:mm A');
        } else if (diff < 168) { // Within a week (168 hours)
            return date.format('dddd [at] h:mm A'); // "Monday at 3:30 PM"
        } else if (date.year() === now.year()) {
            return date.format('MMM D'); // "May 11" (no time)
        } else {
            return date.format('MMM D, YYYY'); // "May 11, 2025" (no time)
        }
    }

    function updateTimeElement(element) {
        // Handle elements with leading span (like "Posted on")
        let rawText = element.getAttribute('title') || element.textContent.trim();
        
        // Attempt to remove a leading child span if it exists
        if (element.children.length && element.children[0].tagName === 'SPAN') {
            rawText = element.childNodes[element.childNodes.length - 1].textContent.trim();
        }

        const date = parseDate(rawText);
        if (date.isValid()) {
            const timeElement = document.createElement('time');
            timeElement.className = 'u-dt';
            timeElement.setAttribute('dir', 'auto');
            timeElement.setAttribute('datetime', date.format());
            
            // Always show full date/time in title/tooltip
            timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A'));
            
            timeElement.textContent = formatDate(date);
            element.replaceWith(timeElement);
        }
    }

    function processTimeElements() {
        const selectors = [
            '.big_list .zz .when',
            '.st-emoji-epost-time',
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
                    const selectors = [
                        '.big_list .zz .when',
                        '.st-emoji-epost-time',
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
