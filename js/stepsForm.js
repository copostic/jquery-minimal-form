/**
 * StepsForm.jquery.js v1.0.0
 * https://github.com/copostic/jquery-minimal-form
 * 
 * Based on StesForm.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2019, CPostic
 * http://www.postic.tk
 */
;(function (window) {

    'use strict';

    const transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        },
        transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
        support = {transitions: Modernizr['csstransitions']};

    function extend(a, b) {
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function StepsForm($el, options) {
        this.$el = $el;
        this.options = extend({}, this.options);
        extend(this.options, options);
        this._init();
    }

    StepsForm.prototype.options = {
        onSubmit: function () {
            return false;
        }
    };

    StepsForm.prototype._init = function () {
        // current question
        this.current = 0;

        // questions
        this.$questions = $('ol.questions > li');

        // total questions
        this.questionsCount = this.$questions.length;
        // show first question

        this.$questions.first().addClass('current');

        // next question control
        this.$ctrlNext = this.$el.find('button.next');

        // progress bar
        this.$progress = this.$el.find('div.progress');

        // question number status
        this.$questionStatus = this.$el.find('span.number');
        // current question placeholder
        this.$currentNum = this.$questionStatus.find('span.number-current');
        this.$currentNum.html(Number(this.current + 1).toString());
        // total questions placeholder
        this.$totalQuestionNum = this.$questionStatus.find('span.number-total');
        this.$totalQuestionNum.html(this.questionsCount);

        // error message
        this.$error = this.$el.find('span.error-message');

        // init events
        this._initEvents();
    };

    StepsForm.prototype._initEvents = function () {
        let self = this,
            // first input
            $firstElInput = this.$questions.eq(this.current).find('input, textarea'),
            // focus
            onFocusStartFn = function () {
                $firstElInput.off('focus', onFocusStartFn);
                self.$ctrlNext.addClass('show');
            };

        // show the next question control first time the input gets focused
        $firstElInput.on('focus', onFocusStartFn);

        // show next question
        this.$ctrlNext.on('click', function (e) {
            e.preventDefault();
            self._nextQuestion();
        });

        // pressing enter will jump to next question
        $(document).on('keydown', function (e) {
            let keyCode = e.keyCode || e.which;
            // enter
            if (keyCode === 13) {
                e.preventDefault();
                self._nextQuestion();
            }
        });

        // disable tab
        this.$el.on('keydown', function (e) {
            let keyCode = e.keyCode || e.which;
            // tab
            if (keyCode === 9) {
                e.preventDefault();
            }
        });
    };

    StepsForm.prototype._nextQuestion = function () {
        if (!this._validate()) {
            return false;
        }

        // check if form is filled
        if (this.current === this.questionsCount - 1) {
            this.isFilled = true;
        }

        // clear any previous error messages
        this._clearError();

        // current question
        let $currentQuestion = this.$questions.eq(this.current);

        // increment current question iterator
        ++this.current;

        // update progress bar
        this._progress();

        if (!this.isFilled) {
            // change the current question number/status
            this._updateQuestionNumber();

            // add class "show-next" to form element (start animations)
            this.$el.addClass('show-next');

            // remove class "current" from current question and add it to the next one
            // current question
            this.$nextQuestion = this.$questions.eq(this.current);
            $currentQuestion.removeClass('current');
            this.$nextQuestion.addClass('current');
        }

        // after animation ends, remove class "show-next" from form element and change current question placeholder
        let self = this,
            onEndTransitionFn = function () {
                if (support.transitions) {
                    this.removeEventListener(transEndEventName, onEndTransitionFn);
                }
                if (self.isFilled) {
                    self._submit();
                }
                else {
                    self.$el.removeClass('show-next');
                    self.$currentNum.html(self.$nextQuestionNum.html());
                    self.$nextQuestionNum.remove();
                    // force the focus on the next input
                    self.$nextQuestion.find('input, textarea').trigger('focus');
                }
            };

        if (support.transitions) {
            this.$progress.on(transEndEventName, onEndTransitionFn);
        }
        else {
            onEndTransitionFn();
        }
    };

    // updates the progress bar by setting its width
    StepsForm.prototype._progress = function () {
        this.$progress.css('width', this.current * (100 / this.questionsCount) + '%');
    };

    // changes the current question number
    StepsForm.prototype._updateQuestionNumber = function () {
        // first, create next question number placeholder
        this.$nextQuestionNum = $('<span>');
        this.$nextQuestionNum.addClass('number-next').html(Number(this.current + 1).toString());
        // insert it in the DOM
        this.$questionStatus.append(this.$nextQuestionNum);
    };

    // submits the form
    StepsForm.prototype._submit = function () {
        this.options.onSubmit(this.$el.get(0));
    };

    // TODO (next version..)
    // the validation function
    StepsForm.prototype._validate = function () {
        // current question´s input
        let value = this.$questions.eq(this.current).find('input, textarea').val();
        if (value === '') {
            this._showError('EMPTYSTR');
            return false;
        }

        return true;
    };

    // TODO (next version..)
    StepsForm.prototype._showError = function (err) {
        let message = '';
        switch (err) {
            case 'EMPTYSTR' :
                message = 'Please fill the field before continuing';
                break;
            case 'INVALIDEMAIL' :
                message = 'Please fill a valid email address';
                break;
            // ...
        }
        this.$error.html(message).addClass('show');
    };

    // clears/hides the current error message
    StepsForm.prototype._clearError = function () {
        this.$error.removeClass('show');
    };

    // add to global namespace
    window.StepsForm = StepsForm;

})(window);
