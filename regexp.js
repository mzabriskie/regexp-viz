(function ($) {
    var regexp = $('regexp'),
        result = $('result'),
        mirror = $('mirror'),
        matchall = $('matchall'),
        matchcase = $('matchcase'),
        multiline = $('multiline'),
        message = $('message');

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
            // Hookup events
            window.addEvent('resize', this.handleResize.bind(this));
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
            result.setStyle('top', ((-result.offsetHeight) + 55) + 'px');
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
            var value = Config.read('result');

            try {
                var rx = new RegExp('(' + Config.read('regexp') + ')', modifiers);
                value = value.replace(rx, '<mark>$1</mark>');
                this.setMessage(this.getMatches(value), false);
            } catch (e) {
                this.setMessage(e.message, true);
            }

            // Set value restoring new lines
            mirror.set('html', value.replace(/\n/g, '<br>'));

            // Save configuration
            Config.save();
        },

        modified: function () {
            return !(regexp.get('value') == Config.read('regexp') &&
                    result.get('value') == Config.read('result') &&
                    matchall.get('checked') == (Config.read('matchall') == 'true') &&
                    matchcase.get('checked') == (Config.read('matchcase') == 'true') &&
                    multiline.get('checked') == (Config.read('multiline') == 'true'));
        },

        getMatches: function (value) {
            var matches = '';

            if (value && value.trim().length > 0) {
                var tmp = value.match(/<mark>/g),
                    len = tmp === null ? 0 : tmp.length;
                matches = (len === 0 ? 'No' : len) + ' Match' + (len === 1 ? '' : 'es') + ' Found';
            }

            return matches;
        },

        setMessage: function (msg, error) {
            message.set('text', msg);
            message.toggleClass('error', error);
        },

        handleKeyUp: function () {
            this.process();
        },

        handleClick: function () {
            this.process();
        },

        handleResize: function () {
            this.scale();
        }
    });
})(document.id);