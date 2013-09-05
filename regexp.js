(function ($) {
    var regexp = $('regexp'),
        result = $('result'),
        mirror = $('mirror'),
        matchall = $('matchall'),
        matchcase = $('matchcase'),
        multiline = $('multiline'),
        message = $('message');

    function getRegexForTag(tag, contents){
        tag = tag || '';
        var regstr = contents ? "<" + tag + "(?!\\w)[^>]*>([\\s\\S]*?)<\/" + tag + "(?!\\w)>" : "<\/?" + tag + "([^>]+)?>";
        return new RegExp(regstr, "gi");
    }

    String.prototype.stripTags = function(tag, contents){
        return this.replace(getRegexForTag(tag, contents), '');
    };

    var Config = new new Class({
        save: function () {
            localStorage.setItem('regexp', regexp.get('text') != regexp.get('placeholder') ? regexp.get('text') : '');
            localStorage.setItem('result', result.get('html') != result.get('placeholder') ? result.get('html') : '');
            localStorage.setItem('matchall', matchall.get('checked'));
            localStorage.setItem('matchcase', matchcase.get('checked'));
            localStorage.setItem('multiline', multiline.get('checked'));
        },

        read: function (name) {
            return localStorage.getItem(name);
        }
    });

    var App = new new Class({
        timer: null,

        initialize: function () {
            // Hookup events
            $('content').addEvent('keyup:relay(#regexp, #result)', this.handleKeyUp.bind(this));
            $('toolbar').addEvent('click:relay(input[type=checkbox])', this.handleClick.bind(this));
            regexp.addEvent('focus', this.handleFocus.bind(this));
            result.addEvent('focus', this.handleFocus.bind(this));
            regexp.addEvent('blur', this.handleBlur.bind(this));
            result.addEvent('blur', this.handleBlur.bind(this));

            // Initialize values
            if (Config.read('regexp') !== null && Config.read('regexp').trim().length > 0) {
                regexp.set('text', Config.read('regexp'));
                regexp.removeClass('placeholder');
            } else {
                regexp.set('text', regexp.get('placeholder'));
                regexp.addClass('placeholder');
            }

            if (Config.read('result') !== null && Config.read('result').trim().length > 0) {
                result.set('html', Config.read('result'));
                result.removeClass('placeholder');
            } else {
                result.set('text', result.get('placeholder'));
                result.addClass('placeholder');
            }

            matchall.set('checked', Config.read('matchall') == 'true');
            matchcase.set('checked', Config.read('matchcase') == 'true');
            multiline.set('checked', Config.read('multiline') == 'true');

            this.setMessage(this.getMatches(Config.read('result')), false);
        },

        process: function () {
            this.timer = null;

            // Don't proceed if nothing has changed
            if (!App.modified()) {
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
            var value = Config.read('result').replace(/<br>/g, "\n").stripTags('mark');

            try {
                var regx = new RegExp('(' + Config.read('regexp') + ')', modifiers);
                value = value.replace(regx, '<mark>$1</mark>');
                this.setMessage(this.getMatches(value), false);
            } catch (e) {
                this.setMessage(e.message, true);
            }

            // Set value restoring new lines
            result.set('html', value.replace(/\n/g, '<br>'));

            // Save configuration
            Config.save();
        },

        modified: function () {
            return !(regexp.get('text') == Config.read('regexp') &&
                    result.get('html') == Config.read('result') &&
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

        handleFocus: function (e) {
            if (e.target.hasClass('placeholder') && e.target.get('text') == e.target.get('placeholder')) {
                e.target.removeClass('placeholder');
                e.target.set('text', '');
            }
        },

        handleBlur: function (e) {
            if (!e.target.hasClass('placeholder') && e.target.get('text').trim().length === 0) {
                e.target.addClass('placeholder');
                e.target.set('text', e.target.get('placeholder'));
            }
        },

        handleKeyUp: function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(function () {
                this.process();
            }.bind(this), 500);
        },

        handleClick: function () {
            this.process();
        }
    });
})(document.id);