document.addEventListener("DOMContentLoaded", function() { 
    // Get user's timezone once
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isGuest = document.body.classList.contains('guest');
    
    function parseDate(dateString) { 
        // Clean the string (remove seconds if present) 
        var cleanString = String(dateString).replace(/:(\d{2})$/, '').trim(); 
        
        // If guest, first try to parse as Italian time and convert to local
        if (isGuest) {
            // Try common Italian formats
            var italianFormats = [
                'D/M/YYYY, HH:mm',
                'D MMM YYYY, HH:mm',
                'D MMMM YYYY, HH:mm',
                'YYYY/MM/DD HH:mm'
            ];
            
            for (var k = 0; k < italianFormats.length; k++) {
                var localTime = convertItalianTimeToLocal(cleanString, italianFormats[k]);
                if (localTime && localTime.isValid()) {
                    return localTime;
                }
            }
        }
        
        // Determine format based on AM/PM 
        var isUSFormat = /AM|PM/i.test(cleanString); 
        
        // Priority 1: Try the detected format (US or EU) with more specific formats
        var formats = isUSFormat 
            ? ['M/D/YYYY, h:mm A', 'M/D/YYYY', 'MMM D, YYYY, h:mm A', 'MMMM D, YYYY, h:mm A'] // US formats 
            : ['D/M/YYYY, HH:mm', 'D/M/YYYY', 'D MMM YYYY, HH:mm', 'D MMMM YYYY, HH:mm']; // EU formats 
        
        for (var i = 0; i < formats.length; i++) { 
            var date = moment(cleanString, formats[i], true); // Strict mode 
            if (date.isValid()) return date; 
        } 
        
        // Priority 2: Fallback to ISO 8601 (e.g., "2025-05-02T00:13:00Z") 
        if (moment(cleanString, moment.ISO_8601, true).isValid()) { 
            return moment(cleanString, moment.ISO_8601, true); 
        } 
        
        // Priority 3: Try common alternative formats before falling back
        var fallbackFormats = [
            'YYYY-MM-DD HH:mm',
            'YYYY/MM/DD HH:mm',
            'MMMM D, YYYY',
            'MMM D, YYYY',
            'YYYY MMMM D',
            'YYYY MMM D'
        ];
        
        for (var j = 0; j < fallbackFormats.length; j++) {
            var fallbackDate = moment(cleanString, fallbackFormats[j], true);
            if (fallbackDate.isValid()) return fallbackDate;
        }
        
        // Last resort
        return moment(cleanString);
    } 
    
    function formatDate(date) { 
        if (!date || !date.isValid()) return 'Invalid date';
        
        var now = moment(); 
        var diff = now.diff(date, 'hours'); 
        
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
    
    function formatMonthYear(date) {
        if (!date || !date.isValid()) return 'Invalid date';
        return date.format('MMM, YYYY');
    }
    
    function convertItalianTimeToLocal(dateString, format) {
        try {
            // Parse with moment using Europe/Rome timezone
            var italianTime = moment.tz(dateString, format, "Europe/Rome");
            if (!italianTime.isValid()) {
                return null;
            }
            
            // Convert to user's local time
            return italianTime.clone().tz(userTimeZone);
        } catch (e) {
            return null;
        }
    }
    
    function isGlitchedDateElement(element) {
        try {
            if (!element) return false;
            
            // Check if element matches the glitched structure
            const daySpan = element.querySelector('.d_day');
            const monthSpan = element.querySelector('.d_month');
            const yearSpan = element.querySelector('.d_year');
            
            return daySpan && monthSpan && yearSpan && 
                   monthSpan.textContent.trim() === '' && 
                   yearSpan.textContent.trim() !== '' &&
                   !element.textContent.includes(':');
        } catch (e) {
            return false;
        }
    }
    
    function handleGlitchedDate(element) {
        try {
            const daySpan = element.querySelector('.d_day');
            const yearSpan = element.querySelector('.d_year');
            
            if (!daySpan || !yearSpan) return null;
            
            // The "day" span actually contains the month number
            const monthNumber = parseInt(daySpan.textContent.trim());
            const year = yearSpan.textContent.trim();
            
            if (isNaN(monthNumber) || !year) return null;
            
            // Create date from month and year only
            const date = moment({year: year, month: monthNumber - 1});
            return date.isValid() ? date : null;
        } catch (e) {
            return null;
        }
    }
    
    function updateTimeagoElement(element) { 
        try {
            var dateString = element.getAttribute('datetime') || 
                element.getAttribute('title') || 
                element.textContent.trim(); 
            
            var date = parseDate(dateString); 
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                timeElement.textContent = formatDate(date);
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateEditElement(element) { 
        try {
            // Only process in topic or search pages
            if (!document.body.matches('#topic, #search')) return;
            
            var text = element.textContent.trim(); 
            var match = text.match(/^(Edited by .+?) - (.+)$/); 
            
            if (match) { 
                var prefix = match[1]; 
                var dateString = match[2]; 
                
                var date = parseDate(dateString); 
                if (date.isValid()) { 
                    var formattedDate = date.format('MMM D, YYYY'); 
                    element.textContent = prefix + ': ' + formattedDate; 
                    
                    var timeElement = document.createElement('time'); 
                    timeElement.className = 'u-dt'; 
                    timeElement.setAttribute('datetime', date.format()); 
                    timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                    timeElement.textContent = formattedDate;
                    timeElement.style.visibility = 'visible';
                    
                    element.innerHTML = prefix + ': '; 
                    element.appendChild(timeElement); 
                } 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateProfileDate(dlElement) { 
        try {
            var whenElement = dlElement.querySelector('.when'); 
            if (!whenElement) return; 
            
            var dateString = whenElement.textContent.trim(); 
            var date = parseDate(dateString); 
            if (!date.isValid()) return; 
            
            var timeElement = document.createElement('time'); 
            timeElement.className = 'u-dt'; 
            timeElement.setAttribute('datetime', date.format()); 
            timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
            timeElement.textContent = date.format('MMM D, YYYY');
            timeElement.style.visibility = 'visible';
            
            whenElement.replaceWith(timeElement);
        } catch (e) {
            return;
        }
    } 
    
    function updateOnlineWhenElement(element) { 
        try {
            if (!document.body.matches('#online')) return; 
            
            var rawText = element.textContent.trim(); 
            var date = parseDate(rawText); 
            
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.classList.add('when'); 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                timeElement.textContent = formatDate(date);
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateArticleWhenElement(element) { 
        try {
            if (!document.body.matches('#blog')) return; 
            
            // Check for glitched date format first
            if (isGlitchedDateElement(element)) {
                var date = handleGlitchedDate(element);
                if (date && date.isValid()) {
                    var timeElement = document.createElement('time'); 
                    timeElement.className = 'u-dt'; 
                    timeElement.classList.add('when'); 
                    timeElement.setAttribute('dir', 'auto'); 
                    timeElement.setAttribute('datetime', date.format()); 
                    timeElement.setAttribute('title', date.format('MMM, YYYY')); 
                    timeElement.textContent = formatMonthYear(date);
                    timeElement.style.visibility = 'visible';
                    element.replaceWith(timeElement);
                    return;
                }
            }
            
            // Normal processing for non-glitched dates
            var day = element.querySelector('.d_day') ? element.querySelector('.d_day').textContent.trim() : ''; 
            var month = element.querySelector('.d_month') ? element.querySelector('.d_month').textContent.trim() : ''; 
            var year = element.querySelector('.d_year') ? element.querySelector('.d_year').textContent.trim() : ''; 
            
            // Clean month (remove duplicate parts like "June" becoming "Jun") 
            month = month.replace(/([A-Za-z]+).*/, '$1'); 
            
            // Construct date string in ISO-like format to avoid parsing issues
            var dateString = year + '-' + month + '-' + day;
            
            // Try parsing with explicit format first
            var date = moment(dateString, 'YYYY-MMM-DD', true);
            if (!date.isValid()) {
                date = parseDate(dateString);
            }
            
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.classList.add('when'); 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                timeElement.textContent = formatDate(date);
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateBtMiniWhenElement(element) { 
        try {
            // Check for glitched date format first
            if (isGlitchedDateElement(element)) {
                var date = handleGlitchedDate(element);
                if (date && date.isValid()) {
                    var timeElement = document.createElement('time'); 
                    timeElement.className = 'u-dt'; 
                    timeElement.classList.add('when'); 
                    timeElement.setAttribute('dir', 'auto'); 
                    timeElement.setAttribute('datetime', date.format()); 
                    timeElement.setAttribute('title', date.format('MMM, YYYY')); 
                    timeElement.textContent = formatMonthYear(date);
                    timeElement.style.visibility = 'visible';
                    element.replaceWith(timeElement);
                    return;
                }
            }
            
            // Normal processing for non-glitched dates
            var day = element.querySelector('.d_day') ? element.querySelector('.d_day').textContent.trim() : ''; 
            var month = element.querySelector('.d_month') ? element.querySelector('.d_month').textContent.trim() : ''; 
            var year = element.querySelector('.d_year') ? element.querySelector('.d_year').textContent.trim() : ''; 
            
            // Clean month (remove duplicate parts like "June" becoming "Jun") 
            month = month.replace(/([A-Za-z]+).*/, '$1'); 
            
            // Construct date string in ISO-like format
            var dateString = year + '-' + month + '-' + day;
            
            // Try parsing with explicit format first
            var date = moment(dateString, 'YYYY-MMM-DD', true);
            if (!date.isValid()) {
                date = parseDate(dateString);
            }
            
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.classList.add('when'); 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                timeElement.textContent = formatDate(date);
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateCcElement(element) { 
        try {
            if (!document.body.matches('#group, #members')) return; 
            
            var dateString = element.textContent.trim(); 
            var date = parseDate(dateString); 
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.classList.add('cc'); 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY')); 
                timeElement.textContent = date.format('MMM D, YYYY');
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateMiniButtonsWhenElement(element) { 
        try {
            if (!document.body.matches('#blog')) return; 
            
            var dateString = element.getAttribute('title') || element.textContent.trim(); 
            // Handle the case where title might include seconds (e.g., "5/6/2025, 04:45 PM:21") 
            dateString = dateString.split(':').slice(0, -1).join(':').trim(); 
            
            var date = parseDate(dateString); 
            if (date.isValid()) { 
                var timeElement = document.createElement('time'); 
                timeElement.className = 'u-dt'; 
                timeElement.classList.add('when'); 
                timeElement.setAttribute('dir', 'auto'); 
                timeElement.setAttribute('datetime', date.format()); 
                timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                timeElement.textContent = formatDate(date);
                timeElement.style.visibility = 'visible';
                element.replaceWith(timeElement); 
            }
        } catch (e) {
            return;
        }
    } 
    
    function updateSideTopicsWhenElement(element) {
        try {
            if (!document.body.matches('#board')) return;
            
            // Get the last text node content (after any spans)
            var textNode = element.lastChild;
            if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
            
            var rawTime = textNode.textContent.trim();
            
            // Convert from Italian time to local time
            var localTime = convertItalianTimeToLocal(rawTime, "D/M/YYYY, HH:mm");
            if (!localTime) return;
            
            var timeElement = document.createElement('time');
            timeElement.className = 'u-dt when';
            timeElement.setAttribute('dir', 'auto');
            timeElement.setAttribute('datetime', localTime.format());
            timeElement.setAttribute('title', localTime.format('MMM D, YYYY [at] h:mm A'));
            timeElement.textContent = formatDate(localTime);
            timeElement.style.visibility = 'visible';
            
            element.replaceWith(timeElement);
        } catch (e) {
            return;
        }
    }
    
    function updateLastArticlesWhenElement(element) {
        try {
            if (!document.body.matches('#board')) return;
            
            // Get the last text node content (after any spans)
            var textNode = element.lastChild;
            if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
            
            var rawTime = textNode.textContent.trim();
            
            // Convert from Italian time to local time
            var localTime = convertItalianTimeToLocal(rawTime, "D/M/YYYY, HH:mm");
            if (!localTime) return;
            
            var timeElement = document.createElement('time');
            timeElement.className = 'u-dt when';
            timeElement.setAttribute('dir', 'auto');
            timeElement.setAttribute('datetime', localTime.format());
            timeElement.setAttribute('title', localTime.format('MMM D, YYYY [at] h:mm A'));
            timeElement.textContent = formatDate(localTime);
            timeElement.style.visibility = 'visible';
            
            element.replaceWith(timeElement);
        } catch (e) {
            return;
        }
    }
    
    function updateEmojiTimeElement(element) {
        try {
            var dateString = element.getAttribute('datetime') || element.textContent.trim();
            
            // Convert from Italian time to local time (format: "2025/05/16 18:32")
            var localTime = convertItalianTimeToLocal(dateString, "YYYY/MM/DD HH:mm");
            if (!localTime) return;
            
            element.textContent = formatDate(localTime);
            element.setAttribute('datetime', localTime.format());
            element.setAttribute('title', localTime.format('MMM D, YYYY [at] h:mm A'));
            element.style.visibility = 'visible';
        } catch (e) {
            return;
        }
    }
    
    function updateTimeElement(element, selector) { 
        try {
            if (element.closest('.edit')) return; 
            if (element.classList.contains('timeago')) return; 
            
            if (selector === '.big_list .zz .when' && 
                !document.body.matches('#board, #forum, #blog, #search')) { 
                return; 
            } 
            if (selector === '.post .title2.top .when' && 
                !document.body.matches('#topic, #search, #blog')) { 
                return; 
            } 
            if (selector === '.summary .when' && 
                !document.body.matches('#send')) { 
                return; 
            } 
            if (selector === '.article .title2.top .when' && 
                !document.body.matches('#blog')) { 
                return; 
            } 
            
            var rawText = element.getAttribute('title') || element.textContent.trim(); 
            
            if (element.children.length && element.children[0].tagName === 'SPAN') { 
                rawText = element.childNodes[element.childNodes.length - 1].textContent.trim(); 
            } 
            
            var date = parseDate(rawText); 
            if (date.isValid()) { 
                if (element.classList.contains('st-emoji-notice-time') || element.classList.contains('st-emoji-epost-time')) { 
                    updateEmojiTimeElement(element);
                } else { 
                    var timeElement = document.createElement('time'); 
                    timeElement.className = 'u-dt'; 
                    if (element.classList.contains('when')) { 
                        timeElement.classList.add('when'); 
                    } 
                    if (element.classList.contains('Item')) { 
                        timeElement.classList.add('Item'); 
                    } 
                    timeElement.setAttribute('dir', 'auto'); 
                    timeElement.setAttribute('datetime', date.format()); 
                    timeElement.setAttribute('title', date.format('MMM D, YYYY [at] h:mm A')); 
                    timeElement.textContent = formatDate(date);
                    timeElement.style.visibility = 'visible';
                    element.replaceWith(timeElement); 
                } 
            }
        } catch (e) {
            return;
        }
    } 
    
    function processTimeElements() { 
        try {
            document.querySelectorAll('dl.profile-joined, dl.profile-lastaction').forEach(updateProfileDate); 
            document.querySelectorAll('.timeago').forEach(updateTimeagoElement); 
            document.querySelectorAll('.post .edit').forEach(updateEditElement); 
            
            if (document.body.matches('#online')) { 
                document.querySelectorAll('.online .yy .when').forEach(updateOnlineWhenElement); 
            } 
            
            if (document.body.matches('#blog')) { 
                document.querySelectorAll('.article .title2.top .when').forEach(updateArticleWhenElement); 
                document.querySelectorAll('.bt_mini .when').forEach(updateBtMiniWhenElement); 
                document.querySelectorAll('.mini_buttons .when').forEach(updateMiniButtonsWhenElement); 
            } 
            
            if (document.body.matches('#group, #members')) { 
                document.querySelectorAll('.big_list .cc').forEach(updateCcElement); 
            }
            
            if (document.body.matches('#board')) {
                document.querySelectorAll('.side_topics .when').forEach(updateSideTopicsWhenElement);
                document.querySelectorAll('.lastarticles .topic .when').forEach(updateLastArticlesWhenElement);
            } 
            
            // Handle emoji time elements everywhere
            document.querySelectorAll('.st-emoji-epost-time, .st-emoji-notice-time').forEach(updateEmojiTimeElement);
            
            var selectors = [ 
                '.big_list .zz .when', 
                '.post-date', 
                '.time', 
                '.date', 
                '.post .title2.top .when', 
                '.summary .when' 
            ]; 
            
            for (var i = 0; i < selectors.length; i++) { 
                var selector = selectors[i]; 
                document.querySelectorAll(selector).forEach(function(element) { 
                    updateTimeElement(element, selector); 
                }); 
            }
        } catch (e) {
            return;
        }
    } 
    
    processTimeElements(); 
    
    var timestampObserver = new MutationObserver(function(mutations) { 
        try {
            mutations.forEach(function(mutation) { 
                mutation.addedNodes.forEach(function(node) { 
                    if (node.nodeType === 1) { 
                        if (node.matches('dl.profile-joined, dl.profile-lastaction')) { 
                            updateProfileDate(node); 
                        } 
                        node.querySelectorAll('dl.profile-joined, dl.profile-lastaction').forEach(updateProfileDate); 
                        
                        if (node.matches('.timeago')) { 
                            updateTimeagoElement(node); 
                        } 
                        node.querySelectorAll('.timeago').forEach(updateTimeagoElement); 
                        
                        if (node.matches('.post .edit') && document.body.matches('#topic, #search')) { 
                            updateEditElement(node); 
                        } 
                        if (document.body.matches('#topic, #search')) { 
                            node.querySelectorAll('.post .edit').forEach(updateEditElement); 
                        } 
                        
                        if (document.body.matches('#online') && node.matches('.online .yy .when')) { 
                            updateOnlineWhenElement(node); 
                        } 
                        if (document.body.matches('#online')) { 
                            node.querySelectorAll('.online .yy .when').forEach(updateOnlineWhenElement); 
                        } 
                        
                        if (document.body.matches('#blog') && node.matches('.article .title2.top .when')) { 
                            updateArticleWhenElement(node); 
                        } 
                        if (document.body.matches('#blog') && node.matches('.bt_mini .when')) { 
                            updateBtMiniWhenElement(node); 
                        } 
                        if (document.body.matches('#blog') && node.matches('.mini_buttons .when')) { 
                            updateMiniButtonsWhenElement(node); 
                        } 
                        if (document.body.matches('#blog')) { 
                            node.querySelectorAll('.article .title2.top .when').forEach(updateArticleWhenElement); 
                            node.querySelectorAll('.bt_mini .when').forEach(updateBtMiniWhenElement); 
                            node.querySelectorAll('.mini_buttons .when').forEach(updateMiniButtonsWhenElement); 
                        } 
                        
                        if (document.body.matches('#group, #members') && node.matches('.big_list .cc')) { 
                            updateCcElement(node); 
                        } 
                        if (document.body.matches('#group, #members')) { 
                            node.querySelectorAll('.big_list .cc').forEach(updateCcElement); 
                        }
                        
                        if (document.body.matches('#board') && node.matches('.side_topics .when')) {
                            updateSideTopicsWhenElement(node);
                        }
                        if (document.body.matches('#board') && node.matches('.lastarticles .topic .when')) {
                            updateLastArticlesWhenElement(node);
                        }
                        if (document.body.matches('#board')) {
                            node.querySelectorAll('.side_topics .when').forEach(updateSideTopicsWhenElement);
                            node.querySelectorAll('.lastarticles .topic .when').forEach(updateLastArticlesWhenElement);
                        }
                        
                        // Handle emoji time elements in new nodes
                        if (node.matches('.st-emoji-epost-time, .st-emoji-notice-time')) {
                            updateEmojiTimeElement(node);
                        }
                        node.querySelectorAll('.st-emoji-epost-time, .st-emoji-notice-time').forEach(updateEmojiTimeElement);
                        
                        var selectors = [ 
                            '.big_list .zz .when', 
                            '.post-date', 
                            '.time', 
                            '.date', 
                            '.post .title2.top .when', 
                            '.summary .when' 
                        ]; 
                        
                        for (var i = 0; i < selectors.length; i++) { 
                            var selector = selectors[i]; 
                            if (node.matches(selector)) { 
                                updateTimeElement(node, selector); 
                            } 
                            node.querySelectorAll(selector).forEach(function(element) { 
                                updateTimeElement(element, selector); 
                            }); 
                        } 
                    } 
                }); 
            });
        } catch (e) {
            return;
        }
    }); 
    
    try {
        timestampObserver.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    } catch (e) {
        return;
    }
});
