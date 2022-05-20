
var UTIL = (function() {
    let util = {};

    util.randomInt = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    util.openInNewTab = function(href) {
        Object.assign(document.createElement('a'), {
            target: '_blank',
            href: href,
        }).click();
    }

    return util;
})();

var API = (function () {
    'use strict'
    let api = {};
    let settings;

    api = function(endpoint, parameters) {
        let body;
        let isJson = false;
        if (parameters instanceof FormData) {
            body = parameters;
            body.append('endpoint', endpoint);
        } else {
            isJson = true;
            let defaultParameters = {
                endpoint: endpoint,
            };
            parameters = Object.assign({}, defaultParameters, parameters);

            body = JSON.stringify(parameters);
        }

        function parseJSON(response) {
            return new Promise((resolve) => response.json()
              .then((json) => resolve({
                status: response.status,
                ok: response.ok,
                json,
              })));
        }

        let fetchOptions = {
            method: 'post',
            body: body,
        }

        if (isJson) {
            fetchOptions.headers = {
                'content-type': 'application/json'
            }
        }

        return new Promise((resolve, reject) => {
            fetch('https://api.miriorama.com/', fetchOptions)
            .then(parseJSON)
            .then((response) => {
                if (response.ok) {
                    return resolve(response.json.content);
                }
                // extract the error from the server's json
                return reject(response.json);
                })
            .catch((error) => reject({
                networkError: error.message,
            }));
        });
    }

	return api;
})();

var MODAL = (function () {
    let modal = {};

    modal.open = function(cssClass = null, templateSelector = null, html = null){
        let $modalContainer = document.querySelector('.modal-container');
        let $modal = $modalContainer.querySelector('.modal');
        let $modalContent = $modalContainer.querySelector('.modal-content');
        $modal.innerHTML = '';

        if(templateSelector) {
            let $template = document.querySelector(templateSelector);
            let $html = $template.content.cloneNode(true);
            $modal.append($html);
            $modal.setAttribute('class', 'modal ' + $template.getAttribute('class'));
        } else if(html) {
            $modal.innerHTML = html;
            $modal.setAttribute('class', 'modal');
        }

        if(cssClass) {
            $modal.classList.add(cssClass);
        }

        $modal.scrollTop = 0;

        $modalContainer.classList.add('visible');
    }

    modal.html = function(html = null){
        let $modalContainer = document.querySelector('.modal-container');
        let $modal = $modalContainer.querySelector('.modal');
        let $modalContent = $modalContainer.querySelector('.modal-content');

        if(html) {
            $modalContent.innerHTML = html;
        }
    }

    modal.close = function(){
        let $modalContainer = document.querySelector('.modal-container');
        let $modal = $modalContainer.querySelector('.modal');

        $modalContainer.classList.remove('visible');
        $modal.setAttribute('class', 'modal');
    }

    modal.success = function(message = 'Richiesta inviata correttamente') {
        message = message + ` <div class=\"modal-footer\">
                        <div class=\"btn btn-light\" onclick=\"MODAL.close();\">CHIUDI</div>
                    </div>`;
        modal.open('modal-success', null, message);
    }

    return modal;
})();

var ALERT = (function () {
    let alert = {};

    alert.success = function(message = null){
        let $alertContainer = document.querySelector('.alert-container');
        let $alert = $alertContainer.querySelector('.alert');
        let $alertContent = $alertContainer.querySelector('.alert-content');

        $alert.setAttribute('class', 'alert alert-success');
        $alertContent.innerHTML = message;

        $alertContainer.classList.add('visible');
    }

    alert.error = function(message = null){
        let $alertContainer = document.querySelector('.alert-container');
        let $alert = $alertContainer.querySelector('.alert');
        let $alertContent = $alertContainer.querySelector('.alert-content');

        $alert.setAttribute('class', 'alert alert-error');
        $alertContent.innerHTML = message;

        $alertContainer.classList.add('visible');
    }

    alert.close = function(message = 'Richiesta inviata correttamente') {
        let $alertContainer = document.querySelector('.alert-container');
        let $alert = $alertContainer.querySelector('.alert');
        let $alertContent = $alertContainer.querySelector('.alert-content');

        $alertContainer.classList.remove('visible');
        $alertContent.innerHTML = '';
    }

    return alert;
})();

var APP = (function() {
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScP4oZ__NerX_e81grWodIpjgRZuMRja-_XQZqSwQScdVAmDA/formResponse';
    let app = {};

    app.onSubmit = function() {
        let submitted=true;
        console.log('form inviato');
    }

    app.insertSubscription = function() {
        let $formSubscription = document.querySelector('.formSubscription');
        let formData = new FormData($formSubscription);

        API('app::insertSubscription', formData)
        .then(function(data){
            MODAL.success('Partecipazione inviata correttamente!');
        })
        .catch(function(error){
            ALERT.error(error.message);
        });
    }

    app.insertSong = function() {
        let $formSong = document.querySelector('.formSong');
        let formData = new FormData($formSong);

        API('app::insertSong', formData)
        .then(function(data){
            MODAL.success('Canzone inviata correttamente.<br>Il Dj ringrazia.');
        })
        .catch(function(error){
            ALERT.error(error.message);
        });
    }

    app.reservedAreaUrl = function() {
        let $formReservedArea = document.querySelector('.formReservedArea');
        let formData = new FormData($formReservedArea);

        API('app::reservedAreaUrl', formData)
        .then(function(data){
            UTIL.openInNewTab(data);
            MODAL.close();
        })
        .catch(function(error){
            ALERT.error(error.message);
        });
    }

    app.reservedAreaHtml = function(key) {
        const params = new URLSearchParams(location.search);

        API('app::reservedAreaHtml', {
            key: params.get('key')
        })
        .then(function(data){
            let $reservedArea = document.querySelector('.reserved-area');
            $reservedArea.innerHTML = data;
        })
        .catch(function(error){
            ALERT.error(error.message);
        });
    }

    app.attendanceOnChange = function($el) {
        let $onlyThere = document.querySelector('.only-there');

        if($el.value == 1) {
            $onlyThere.removeAttribute('disabled');
        } else {
            $onlyThere.setAttribute('disabled', '');
        }

    }

    app.polaroidAnimate = function() {
        let $imgs = document.querySelectorAll(".no-animation");
        for (const $img of $imgs) {
            $img.classList.remove('no-animation');
        }
    }

    return app;
})();

window.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(function() {
        APP.polaroidAnimate();
    }, 300);
});