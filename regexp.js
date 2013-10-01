(function ($) {
    var regexp = $('regexp'),
        result = $('result'),
        mirror = $('mirror'),
        matchall = $('matchall'),
        matchcase = $('matchcase'),
        multiline = $('multiline'),
        message = $('message');

    function encodeHtml(html) {
        var div = new Element('div');
        div.set('text', html);
        return div.get('html');
    }

    var Config = new new Class({
        save: function () {
            localStorage.setItem('regexp', regexp.get('value'));
            localStorage.setItem('result', result.get('value'));
            localStorage.setItem('matchall', matchall.get('checked'));
            localStorage.setItem('matchcase', matchcase.get('checked'));
            localStorage.setItem('multiline', multiline.get('checked'));
        },

        read: function (name) {
            return localStorage.getItem(name);
        }
    });

    var App = new new Class({
        initialize: function () {
            document.html.addClass(Browser.name);

            // Hookup events
            window.addEvent('resize', this.handleResize.bind(this));
            result.addEvent('scroll', this.handleScroll.bind(this));
            $('content').addEvent('keyup:relay(#regexp, #result)', this.handleKeyUp.bind(this));
            $('toolbar').addEvent('click:relay(input[type=checkbox])', this.handleClick.bind(this));

            // Initialize values
            if (Config.read('regexp') !== null && Config.read('regexp').trim().length > 0) {
                regexp.set('value', Config.read('regexp'));
            }

            if (Config.read('result') !== null && Config.read('result').trim().length > 0) {
                result.set('value', Config.read('result'));
            }

            matchall.set('checked', Config.read('matchall') == 'true');
            matchcase.set('checked', Config.read('matchcase') == 'true');
            multiline.set('checked', Config.read('multiline') == 'true');

            this.process(true);
            this.scale();
        },

        scale: function () {
            if (Browser.name === 'firefox' ||
                Browser.name === 'ie') {
                result.setStyle('height', mirror.offsetHeight + 'px');
            }
        },

        adjust: function () {
            mirror.scrollTop = result.scrollTop;
            mirror.scrollLeft = result.scrollLeft;
        },

        process: function (force) {
            // Don't proceed if nothing has changed
            if (!force && !this.modified()) {
                return;
            }

            // Save configuration
            Config.save();

            // Build modifiers
            var modifiers = '';
            if (matchall.get('checked')) {
                modifiers += 'g';
            }
            if (!matchcase.get('checked')) {
                modifiers += 'i';
            }
            if (multiline.get('checked')) {
                modifiers += 'm';
            }

            // Get value removing HTML tags and preserving new lines
            var value = encodeHtml(Config.read('result'));

            try {
                var count = 0;
                
                if (Config.read('regexp').trim().length > 0 &&
                    Config.read('result').trim().length > 0) {

                    var rx = Config.read('regexp');

                    // Add grouping for simple expressions so that matches are highlighted
                    if (rx.indexOf('(') < 0 && rx.indexOf(')') < 0) {
                        rx = '(' + rx + ')';
                    }

                    // Highlight matches
                    value = value.replace(new RegExp(encodeHtml(rx), modifiers), function (result) {
                        count++;
                        var offset = 0,
                            index = 1;

                        // Highlight the entire result
                        result = this.mark(result, arguments[0], 0, 0);
                        offset = 17; // 17 is the length of <mark class="m0">

                        // Highlight each grouping
                        for (var i=1,l=arguments.length - 2; i<l; i++) {
                            if (!arguments[i]) continue; // ignore empty strings, or undefined
                            offset = result.indexOf(arguments[i], offset);
                            result = this.mark(result, arguments[i], index++, offset);
                            offset += arguments[i].length + 24; // 24 is the length of <mark class="m1">...</mark>
                        }
                        return result;
                    }.bind(this));
                }
                this.log((count === 0 ? 'No' : count) + ' Match' + (count === 1 ? '' : 'es') + ' Found');
            } catch (e) {
                this.log(e);
            }

            // Set value restoring new lines and spaces
            mirror.set('html', value.replace(/\n/g, '<br/>').replace(/^ /, '&nbsp;').replace(/  /g, '&nbsp;&nbsp;'));
        },

        mark: function (haystack, needle, index, offset) {
            return haystack.substring(0, offset) +
                    '<mark class="m' + index + '">' + needle + '</mark>' +
                    haystack.substring(offset + needle.length);
        },

        modified: function () {
            return !(regexp.get('value') == Config.read('regexp') &&
                    result.get('value') == Config.read('result') &&
                    matchall.get('checked') == (Config.read('matchall') == 'true') &&
                    matchcase.get('checked') == (Config.read('matchcase') == 'true') &&
                    multiline.get('checked') == (Config.read('multiline') == 'true'));
        },

        log: function (msg) {
            message.set('text', msg && msg.message ? msg.message : msg);
            message.toggleClass('error', !!(msg && msg.message));
        },

        handleKeyUp: function () {
            this.process();
            this.adjust();
        },

        handleClick: function () {
            this.process();
        },

        handleResize: function () {
            this.scale();
        },

        handleScroll: function () {
            this.adjust();
        }
    });
})(document.id);